CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: card_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.card_category AS ENUM (
    'INFO',
    'CONSULTÁVEL'
);


--
-- Name: consultavel_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.consultavel_type AS ENUM (
    'CT',
    'ST'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user_admin_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_admin_role() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Add admin role for specific emails
  IF NEW.email IN ('admin@admin.com', 'mucart734@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user_balance(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_balance() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.user_balances (user_id, balance)
  VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


--
-- Name: update_chat_last_message(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_chat_last_message() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE public.support_chats
  SET last_message_at = NOW(), updated_at = NOW()
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: account_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    account_type text NOT NULL,
    vehicle_category text NOT NULL,
    vehicle_plate text NOT NULL,
    first_name text,
    face_photo_url text,
    rg_front_url text,
    rg_back_url text,
    email text,
    phone text,
    status text DEFAULT 'pending'::text NOT NULL,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT account_requests_account_type_check CHECK ((account_type = ANY (ARRAY['99'::text, 'Uber'::text]))),
    CONSTRAINT account_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'cancelled'::text]))),
    CONSTRAINT account_requests_vehicle_category_check CHECK ((vehicle_category = ANY (ARRAY['Carro'::text, 'Moto'::text])))
);


--
-- Name: card_mixes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.card_mixes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    price numeric DEFAULT 0 NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    created_by uuid,
    is_active boolean DEFAULT true NOT NULL,
    stock integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    card_data text
);


--
-- Name: cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    image text,
    category public.card_category NOT NULL,
    stock integer DEFAULT 1 NOT NULL,
    card_number text,
    card_expiry text,
    card_cvv text,
    cpf text,
    holder_name text,
    card_level text,
    bank_name text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    subcategory text
);


--
-- Name: consultaveis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consultaveis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type public.consultavel_type NOT NULL,
    name text NOT NULL,
    description text,
    price numeric DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    image_url text,
    card_number text,
    card_expiry text,
    card_cvv text,
    card_level text,
    bank_name text
);


--
-- Name: consultavel_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consultavel_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    consultavel_id uuid NOT NULL,
    image_url text NOT NULL,
    title text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: feedbacks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feedbacks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    user_name text NOT NULL,
    message text NOT NULL,
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: kl_remota_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kl_remota_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    price numeric DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: kl_remota_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kl_remota_files (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    file_url text NOT NULL,
    file_type text DEFAULT 'file'::text NOT NULL,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid
);


--
-- Name: kl_remota_purchases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kl_remota_purchases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    price numeric NOT NULL,
    status text DEFAULT 'completed'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: module_descriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.module_descriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    module_name text NOT NULL,
    title text NOT NULL,
    subtitle text,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: module_media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.module_media (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    module_name text NOT NULL,
    title text NOT NULL,
    description text,
    media_type text NOT NULL,
    media_url text NOT NULL,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    CONSTRAINT module_media_media_type_check CHECK ((media_type = ANY (ARRAY['video'::text, 'image'::text])))
);


--
-- Name: news_announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news_announcements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid
);


--
-- Name: pix_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pix_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    amount numeric NOT NULL,
    external_reference text NOT NULL,
    mercado_pago_id text,
    status text DEFAULT 'pending'::text NOT NULL,
    qr_code text,
    qr_code_base64 text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    paid_at timestamp with time zone
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_banned boolean DEFAULT false NOT NULL
);


--
-- Name: purchases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    card_id uuid NOT NULL,
    card_name text NOT NULL,
    card_category text NOT NULL,
    price numeric NOT NULL,
    payment_method text DEFAULT 'balance'::text NOT NULL,
    status text DEFAULT 'completed'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    card_number text,
    card_expiry text,
    card_cvv text,
    cpf text,
    holder_name text,
    card_level text,
    bank_name text,
    description text
);


--
-- Name: support_chats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_chats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    user_name text NOT NULL,
    user_email text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_message_at timestamp with time zone DEFAULT now(),
    CONSTRAINT support_chats_status_check CHECK ((status = ANY (ARRAY['open'::text, 'closed'::text])))
);


--
-- Name: support_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    sender_type text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT support_messages_sender_type_check CHECK ((sender_type = ANY (ARRAY['user'::text, 'admin'::text])))
);


--
-- Name: user_balances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_balances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    balance numeric DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: account_requests account_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_requests
    ADD CONSTRAINT account_requests_pkey PRIMARY KEY (id);


--
-- Name: card_mixes card_mixes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_mixes
    ADD CONSTRAINT card_mixes_pkey PRIMARY KEY (id);


--
-- Name: cards cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_pkey PRIMARY KEY (id);


--
-- Name: consultaveis consultaveis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultaveis
    ADD CONSTRAINT consultaveis_pkey PRIMARY KEY (id);


--
-- Name: consultavel_images consultavel_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultavel_images
    ADD CONSTRAINT consultavel_images_pkey PRIMARY KEY (id);


--
-- Name: feedbacks feedbacks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_pkey PRIMARY KEY (id);


--
-- Name: kl_remota_config kl_remota_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kl_remota_config
    ADD CONSTRAINT kl_remota_config_pkey PRIMARY KEY (id);


--
-- Name: kl_remota_files kl_remota_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kl_remota_files
    ADD CONSTRAINT kl_remota_files_pkey PRIMARY KEY (id);


--
-- Name: kl_remota_purchases kl_remota_purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kl_remota_purchases
    ADD CONSTRAINT kl_remota_purchases_pkey PRIMARY KEY (id);


--
-- Name: module_descriptions module_descriptions_module_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.module_descriptions
    ADD CONSTRAINT module_descriptions_module_name_key UNIQUE (module_name);


--
-- Name: module_descriptions module_descriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.module_descriptions
    ADD CONSTRAINT module_descriptions_pkey PRIMARY KEY (id);


--
-- Name: module_media module_media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.module_media
    ADD CONSTRAINT module_media_pkey PRIMARY KEY (id);


--
-- Name: news_announcements news_announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_announcements
    ADD CONSTRAINT news_announcements_pkey PRIMARY KEY (id);


--
-- Name: pix_payments pix_payments_external_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pix_payments
    ADD CONSTRAINT pix_payments_external_reference_key UNIQUE (external_reference);


--
-- Name: pix_payments pix_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pix_payments
    ADD CONSTRAINT pix_payments_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: support_chats support_chats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_chats
    ADD CONSTRAINT support_chats_pkey PRIMARY KEY (id);


--
-- Name: support_messages support_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_messages
    ADD CONSTRAINT support_messages_pkey PRIMARY KEY (id);


--
-- Name: user_balances user_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_balances
    ADD CONSTRAINT user_balances_pkey PRIMARY KEY (id);


--
-- Name: user_balances user_balances_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_balances
    ADD CONSTRAINT user_balances_user_id_key UNIQUE (user_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_consultavel_images_consultavel_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_consultavel_images_consultavel_id ON public.consultavel_images USING btree (consultavel_id);


--
-- Name: idx_support_chats_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_chats_status ON public.support_chats USING btree (status);


--
-- Name: idx_support_chats_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_chats_user_id ON public.support_chats USING btree (user_id);


--
-- Name: idx_support_messages_chat_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_messages_chat_id ON public.support_messages USING btree (chat_id);


--
-- Name: idx_support_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_messages_created_at ON public.support_messages USING btree (created_at);


--
-- Name: support_messages on_new_message_update_chat; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_new_message_update_chat AFTER INSERT ON public.support_messages FOR EACH ROW EXECUTE FUNCTION public.update_chat_last_message();


--
-- Name: profiles on_profile_created_admin_role; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_profile_created_admin_role AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_admin_role();


--
-- Name: account_requests update_account_requests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_account_requests_updated_at BEFORE UPDATE ON public.account_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: card_mixes update_card_mixes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_card_mixes_updated_at BEFORE UPDATE ON public.card_mixes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cards update_cards_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON public.cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: consultaveis update_consultaveis_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_consultaveis_updated_at BEFORE UPDATE ON public.consultaveis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: consultavel_images update_consultavel_images_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_consultavel_images_updated_at BEFORE UPDATE ON public.consultavel_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: module_descriptions update_module_descriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_module_descriptions_updated_at BEFORE UPDATE ON public.module_descriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: module_media update_module_media_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_module_media_updated_at BEFORE UPDATE ON public.module_media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: news_announcements update_news_announcements_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_news_announcements_updated_at BEFORE UPDATE ON public.news_announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: pix_payments update_pix_payments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_pix_payments_updated_at BEFORE UPDATE ON public.pix_payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_balances update_user_balances_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_balances_updated_at BEFORE UPDATE ON public.user_balances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: account_requests account_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_requests
    ADD CONSTRAINT account_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: cards cards_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: consultavel_images consultavel_images_consultavel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consultavel_images
    ADD CONSTRAINT consultavel_images_consultavel_id_fkey FOREIGN KEY (consultavel_id) REFERENCES public.consultaveis(id) ON DELETE CASCADE;


--
-- Name: module_media module_media_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.module_media
    ADD CONSTRAINT module_media_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: news_announcements news_announcements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_announcements
    ADD CONSTRAINT news_announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: purchases purchases_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.cards(id) ON DELETE CASCADE;


--
-- Name: purchases purchases_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: support_messages support_messages_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_messages
    ADD CONSTRAINT support_messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.support_chats(id) ON DELETE CASCADE;


--
-- Name: user_balances user_balances_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_balances
    ADD CONSTRAINT user_balances_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_balances Admins can delete balances; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete balances" ON public.user_balances FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cards Admins can delete cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete cards" ON public.cards FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: feedbacks Admins can delete feedbacks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete feedbacks" ON public.feedbacks FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can delete profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: account_requests Admins can delete requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete requests" ON public.account_requests FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_balances Admins can insert balances; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert balances" ON public.user_balances FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cards Admins can insert cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert cards" ON public.cards FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: kl_remota_config Admins can manage KL config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage KL config" ON public.kl_remota_config USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: kl_remota_files Admins can manage KL files; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage KL files" ON public.kl_remota_files USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: news_announcements Admins can manage announcements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage announcements" ON public.news_announcements USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: consultavel_images Admins can manage consultavel images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage consultavel images" ON public.consultavel_images USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: consultaveis Admins can manage consultáveis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage consultáveis" ON public.consultaveis USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: module_media Admins can manage media; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage media" ON public.module_media USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: card_mixes Admins can manage mixes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage mixes" ON public.card_mixes USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: module_descriptions Admins can manage module descriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage module descriptions" ON public.module_descriptions USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: support_messages Admins can send messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can send messages" ON public.support_messages FOR INSERT WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) AND (sender_type = 'admin'::text)));


--
-- Name: user_balances Admins can update all balances; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all balances" ON public.user_balances FOR UPDATE USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR (auth.uid() = user_id)));


--
-- Name: support_chats Admins can update all chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all chats" ON public.support_chats FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can update any profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cards Admins can update cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update cards" ON public.cards FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: feedbacks Admins can update feedbacks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update feedbacks" ON public.feedbacks FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: support_messages Admins can update messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update messages" ON public.support_messages FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: account_requests Admins can update requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update requests" ON public.account_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: kl_remota_purchases Admins can view all KL purchases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all KL purchases" ON public.kl_remota_purchases USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_balances Admins can view all balances; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all balances" ON public.user_balances FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: support_chats Admins can view all chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all chats" ON public.support_chats FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: support_messages Admins can view all messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all messages" ON public.support_messages FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: pix_payments Admins can view all payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all payments" ON public.pix_payments FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: account_requests Admins can view all requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all requests" ON public.account_requests FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: kl_remota_config Anyone can view KL config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view KL config" ON public.kl_remota_config FOR SELECT USING (true);


--
-- Name: news_announcements Anyone can view active announcements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active announcements" ON public.news_announcements FOR SELECT USING ((is_active = true));


--
-- Name: consultavel_images Anyone can view active consultavel images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active consultavel images" ON public.consultavel_images FOR SELECT USING ((is_active = true));


--
-- Name: consultaveis Anyone can view active consultáveis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active consultáveis" ON public.consultaveis FOR SELECT USING ((is_active = true));


--
-- Name: module_media Anyone can view active media; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active media" ON public.module_media FOR SELECT USING ((is_active = true));


--
-- Name: card_mixes Anyone can view active mixes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active mixes" ON public.card_mixes FOR SELECT USING (((is_active = true) AND (stock > 0)));


--
-- Name: cards Anyone can view cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view cards" ON public.cards FOR SELECT USING (true);


--
-- Name: feedbacks Anyone can view feedbacks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view feedbacks" ON public.feedbacks FOR SELECT USING (true);


--
-- Name: module_descriptions Anyone can view module descriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view module descriptions" ON public.module_descriptions FOR SELECT USING (true);


--
-- Name: pix_payments Service role can update payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can update payments" ON public.pix_payments FOR UPDATE USING (true);


--
-- Name: user_balances System can insert user balance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert user balance" ON public.user_balances FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: support_chats Users can create their own chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own chats" ON public.support_chats FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: feedbacks Users can create their own feedbacks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own feedbacks" ON public.feedbacks FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (NOT (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_banned = true)))))));


--
-- Name: pix_payments Users can create their own payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own payments" ON public.pix_payments FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: purchases Users can create their own purchases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own purchases" ON public.purchases FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: kl_remota_purchases Users can insert their own KL purchases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own KL purchases" ON public.kl_remota_purchases FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: account_requests Users can insert their own requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own requests" ON public.account_requests FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: support_messages Users can send messages to their chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can send messages to their chats" ON public.support_messages FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM public.support_chats
  WHERE ((support_chats.id = support_messages.chat_id) AND (support_chats.user_id = auth.uid())))) AND (sender_type = 'user'::text)));


--
-- Name: support_chats Users can update their own chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own chats" ON public.support_chats FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: support_messages Users can view messages in their chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view messages in their chats" ON public.support_messages FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.support_chats
  WHERE ((support_chats.id = support_messages.chat_id) AND (support_chats.user_id = auth.uid())))));


--
-- Name: kl_remota_purchases Users can view their own KL purchases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own KL purchases" ON public.kl_remota_purchases FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_balances Users can view their own balance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own balance" ON public.user_balances FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: support_chats Users can view their own chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own chats" ON public.support_chats FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: pix_payments Users can view their own payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own payments" ON public.pix_payments FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: account_requests Users can view their own requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own requests" ON public.account_requests FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: kl_remota_files Users with purchase can view KL files; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users with purchase can view KL files" ON public.kl_remota_files FOR SELECT USING (((is_active = true) AND (EXISTS ( SELECT 1
   FROM public.kl_remota_purchases
  WHERE ((kl_remota_purchases.user_id = auth.uid()) AND (kl_remota_purchases.status = 'completed'::text))))));


--
-- Name: purchases View purchases (user or admin); Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "View purchases (user or admin)" ON public.purchases FOR SELECT USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: account_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.account_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: card_mixes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.card_mixes ENABLE ROW LEVEL SECURITY;

--
-- Name: cards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

--
-- Name: consultaveis; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.consultaveis ENABLE ROW LEVEL SECURITY;

--
-- Name: consultavel_images; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.consultavel_images ENABLE ROW LEVEL SECURITY;

--
-- Name: feedbacks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

--
-- Name: kl_remota_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.kl_remota_config ENABLE ROW LEVEL SECURITY;

--
-- Name: kl_remota_files; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.kl_remota_files ENABLE ROW LEVEL SECURITY;

--
-- Name: kl_remota_purchases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.kl_remota_purchases ENABLE ROW LEVEL SECURITY;

--
-- Name: module_descriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.module_descriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: module_media; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.module_media ENABLE ROW LEVEL SECURITY;

--
-- Name: news_announcements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.news_announcements ENABLE ROW LEVEL SECURITY;

--
-- Name: pix_payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pix_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: purchases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

--
-- Name: support_chats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.support_chats ENABLE ROW LEVEL SECURITY;

--
-- Name: support_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: user_balances; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;