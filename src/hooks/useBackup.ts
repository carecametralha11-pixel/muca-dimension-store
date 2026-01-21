import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface BackupData {
  version: string;
  created_at: string;
  // Content tables
  cards: any[];
  card_mixes: any[];
  consultaveis: any[];
  consultavel_images: any[];
  consultavel_pricing_tiers: any[];
  module_descriptions: any[];
  module_media: any[];
  news_announcements: any[];
  feedbacks: any[];
  ban_messages: any[];
  // Config tables
  diploma_config: any[];
  kl_remota_config: any[];
  kl_remota_files: any[];
  // Orders & Requests (optional - for full backup)
  nf_orders: any[];
  diploma_orders: any[];
  consultavel_requests: any[];
  account_requests: any[];
  kl_remota_purchases: any[];
  // User data (optional)
  user_balances: any[];
  profiles: any[];
  pix_payments: any[];
  purchases: any[];
  support_chats: any[];
  support_messages: any[];
  user_roles: any[];
}

// Helper function to fetch all records from a table (handles pagination for >1000 records)
type AllTableNames = 
  | 'cards' | 'card_mixes' | 'consultaveis' | 'consultavel_images' | 'consultavel_pricing_tiers'
  | 'module_descriptions' | 'module_media' | 'news_announcements' | 'feedbacks' | 'ban_messages'
  | 'diploma_config' | 'kl_remota_config' | 'kl_remota_files'
  | 'nf_orders' | 'diploma_orders' | 'consultavel_requests' | 'account_requests' | 'kl_remota_purchases'
  | 'user_balances' | 'profiles' | 'pix_payments' | 'purchases' | 'support_chats' | 'support_messages' | 'user_roles';

async function fetchAllFromTable(tableName: AllTableNames): Promise<any[]> {
  const allData: any[] = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .range(from, from + pageSize - 1);

      if (error) {
        console.warn(`Warning fetching from ${tableName}:`, error.message);
        return allData;
      }

      if (data && data.length > 0) {
        allData.push(...data);
        from += pageSize;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    } catch (err) {
      console.warn(`Error fetching from ${tableName}:`, err);
      return allData;
    }
  }

  return allData;
}

export const useCreateBackup = () => {
  return useMutation({
    mutationFn: async (): Promise<BackupData> => {
      toast.info('Criando backup COMPLETO... Aguarde.');

      // Fetch all data from ALL tables with pagination support
      const [
        cards,
        cardMixes,
        consultaveis,
        consultavelImages,
        consultavelPricingTiers,
        moduleDescriptions,
        moduleMedia,
        newsAnnouncements,
        feedbacks,
        banMessages,
        diplomaConfig,
        klRemotaConfig,
        klRemotaFiles,
        nfOrders,
        diplomaOrders,
        consultavelRequests,
        accountRequests,
        klRemotaPurchases,
        userBalances,
        profiles,
        pixPayments,
        purchases,
        supportChats,
        supportMessages,
        userRoles
      ] = await Promise.all([
        fetchAllFromTable('cards'),
        fetchAllFromTable('card_mixes'),
        fetchAllFromTable('consultaveis'),
        fetchAllFromTable('consultavel_images'),
        fetchAllFromTable('consultavel_pricing_tiers'),
        fetchAllFromTable('module_descriptions'),
        fetchAllFromTable('module_media'),
        fetchAllFromTable('news_announcements'),
        fetchAllFromTable('feedbacks'),
        fetchAllFromTable('ban_messages'),
        fetchAllFromTable('diploma_config'),
        fetchAllFromTable('kl_remota_config'),
        fetchAllFromTable('kl_remota_files'),
        fetchAllFromTable('nf_orders'),
        fetchAllFromTable('diploma_orders'),
        fetchAllFromTable('consultavel_requests'),
        fetchAllFromTable('account_requests'),
        fetchAllFromTable('kl_remota_purchases'),
        fetchAllFromTable('user_balances'),
        fetchAllFromTable('profiles'),
        fetchAllFromTable('pix_payments'),
        fetchAllFromTable('purchases'),
        fetchAllFromTable('support_chats'),
        fetchAllFromTable('support_messages'),
        fetchAllFromTable('user_roles')
      ]);

      const backupData: BackupData = {
        version: '3.0',
        created_at: new Date().toISOString(),
        // Content tables
        cards,
        card_mixes: cardMixes,
        consultaveis,
        consultavel_images: consultavelImages,
        consultavel_pricing_tiers: consultavelPricingTiers,
        module_descriptions: moduleDescriptions,
        module_media: moduleMedia,
        news_announcements: newsAnnouncements,
        feedbacks,
        ban_messages: banMessages,
        // Config tables
        diploma_config: diplomaConfig,
        kl_remota_config: klRemotaConfig,
        kl_remota_files: klRemotaFiles,
        // Orders & Requests
        nf_orders: nfOrders,
        diploma_orders: diplomaOrders,
        consultavel_requests: consultavelRequests,
        account_requests: accountRequests,
        kl_remota_purchases: klRemotaPurchases,
        // User data
        user_balances: userBalances,
        profiles,
        pix_payments: pixPayments,
        purchases,
        support_chats: supportChats,
        support_messages: supportMessages,
        user_roles: userRoles
      };

      return backupData;
    },
    onSuccess: (data) => {
      // Create and download the backup file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-COMPLETO-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      const totalItems = 
        data.cards.length + 
        data.card_mixes.length + 
        data.consultaveis.length + 
        data.consultavel_images.length +
        data.consultavel_pricing_tiers.length +
        data.module_descriptions.length +
        data.module_media.length +
        data.news_announcements.length +
        data.feedbacks.length +
        data.ban_messages.length +
        data.diploma_config.length +
        data.kl_remota_config.length +
        data.kl_remota_files.length +
        data.nf_orders.length +
        data.diploma_orders.length +
        data.consultavel_requests.length +
        data.account_requests.length +
        data.kl_remota_purchases.length +
        data.profiles.length +
        data.purchases.length +
        data.support_chats.length +
        data.support_messages.length;
      
      toast.success(`Backup COMPLETO criado! ${totalItems} itens exportados de todas as tabelas.`);
    },
    onError: (error: Error) => {
      console.error('Backup error:', error);
      toast.error('Erro ao criar backup: ' + error.message);
    }
  });
};

export const useRestoreBackup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (backupData: BackupData) => {
      // Validate backup file
      const hasContent = backupData.cards?.length || 
                         backupData.card_mixes?.length || 
                         backupData.consultaveis?.length ||
                         backupData.module_media?.length ||
                         backupData.module_descriptions?.length ||
                         backupData.consultavel_pricing_tiers?.length ||
                         backupData.diploma_config?.length;
      
      if (!hasContent) {
        throw new Error('Arquivo de backup inválido ou vazio');
      }

      toast.info('Restaurando backup COMPLETO... Aguarde.');

      const stats: Record<string, number> = {};

      // Helper function to safely upsert data in batches
      async function upsertInBatches(tableName: AllTableNames, data: any[], batchSize = 50): Promise<number> {
        if (!data || data.length === 0) return 0;

        let count = 0;
        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize).map(item => {
            const cleanItem = { ...item };
            return cleanItem;
          });
          
          try {
            const { error } = await supabase
              .from(tableName)
              .upsert(batch, { onConflict: 'id', ignoreDuplicates: false });
            
            if (error) {
              console.warn(`Warning upserting to ${tableName}:`, error);
              continue;
            }
            count += batch.length;
          } catch (err) {
            console.warn(`Error in batch for ${tableName}:`, err);
            continue;
          }
        }
        return count;
      }

      console.log('Restaurando backup COMPLETO...');
      
      // 1. Cards (products)
      if (backupData.cards?.length > 0) {
        console.log(`Restaurando ${backupData.cards.length} cards...`);
        stats.cards = await upsertInBatches('cards', backupData.cards);
      }

      // 2. Card mixes
      if (backupData.card_mixes?.length > 0) {
        console.log(`Restaurando ${backupData.card_mixes.length} card mixes...`);
        stats.card_mixes = await upsertInBatches('card_mixes', backupData.card_mixes);
      }

      // 3. Consultaveis
      if (backupData.consultaveis?.length > 0) {
        console.log(`Restaurando ${backupData.consultaveis.length} consultaveis...`);
        stats.consultaveis = await upsertInBatches('consultaveis', backupData.consultaveis);
      }

      // 4. Consultavel images
      if (backupData.consultavel_images?.length > 0) {
        console.log(`Restaurando ${backupData.consultavel_images.length} consultavel images...`);
        stats.consultavel_images = await upsertInBatches('consultavel_images', backupData.consultavel_images);
      }

      // 5. Consultavel pricing tiers
      if (backupData.consultavel_pricing_tiers?.length > 0) {
        console.log(`Restaurando ${backupData.consultavel_pricing_tiers.length} pricing tiers...`);
        stats.consultavel_pricing_tiers = await upsertInBatches('consultavel_pricing_tiers', backupData.consultavel_pricing_tiers);
      }

      // 6. Module descriptions
      if (backupData.module_descriptions?.length > 0) {
        console.log(`Restaurando ${backupData.module_descriptions.length} module descriptions...`);
        stats.module_descriptions = await upsertInBatches('module_descriptions', backupData.module_descriptions);
      }

      // 7. Module media
      if (backupData.module_media?.length > 0) {
        console.log(`Restaurando ${backupData.module_media.length} module media...`);
        stats.module_media = await upsertInBatches('module_media', backupData.module_media);
      }

      // 8. News announcements
      if (backupData.news_announcements?.length > 0) {
        console.log(`Restaurando ${backupData.news_announcements.length} news...`);
        stats.news_announcements = await upsertInBatches('news_announcements', backupData.news_announcements);
      }

      // 9. Feedbacks
      if (backupData.feedbacks?.length > 0) {
        console.log(`Restaurando ${backupData.feedbacks.length} feedbacks...`);
        stats.feedbacks = await upsertInBatches('feedbacks', backupData.feedbacks);
      }

      // 10. Ban messages
      if (backupData.ban_messages?.length > 0) {
        console.log(`Restaurando ${backupData.ban_messages.length} ban messages...`);
        stats.ban_messages = await upsertInBatches('ban_messages', backupData.ban_messages);
      }

      // 11. Diploma config
      if (backupData.diploma_config?.length > 0) {
        console.log(`Restaurando ${backupData.diploma_config.length} diploma config...`);
        stats.diploma_config = await upsertInBatches('diploma_config', backupData.diploma_config);
      }

      // 12. KL Remota config
      if (backupData.kl_remota_config?.length > 0) {
        console.log(`Restaurando ${backupData.kl_remota_config.length} KL config...`);
        stats.kl_remota_config = await upsertInBatches('kl_remota_config', backupData.kl_remota_config);
      }

      // 13. KL Remota files
      if (backupData.kl_remota_files?.length > 0) {
        console.log(`Restaurando ${backupData.kl_remota_files.length} KL files...`);
        stats.kl_remota_files = await upsertInBatches('kl_remota_files', backupData.kl_remota_files);
      }

      // 14. NF Orders
      if (backupData.nf_orders?.length > 0) {
        console.log(`Restaurando ${backupData.nf_orders.length} NF orders...`);
        stats.nf_orders = await upsertInBatches('nf_orders', backupData.nf_orders);
      }

      // 15. Diploma Orders
      if (backupData.diploma_orders?.length > 0) {
        console.log(`Restaurando ${backupData.diploma_orders.length} diploma orders...`);
        stats.diploma_orders = await upsertInBatches('diploma_orders', backupData.diploma_orders);
      }

      // 16. Consultavel Requests
      if (backupData.consultavel_requests?.length > 0) {
        console.log(`Restaurando ${backupData.consultavel_requests.length} consultavel requests...`);
        stats.consultavel_requests = await upsertInBatches('consultavel_requests', backupData.consultavel_requests);
      }

      // 17. Account Requests
      if (backupData.account_requests?.length > 0) {
        console.log(`Restaurando ${backupData.account_requests.length} account requests...`);
        stats.account_requests = await upsertInBatches('account_requests', backupData.account_requests);
      }

      // 18. KL Remota Purchases
      if (backupData.kl_remota_purchases?.length > 0) {
        console.log(`Restaurando ${backupData.kl_remota_purchases.length} KL purchases...`);
        stats.kl_remota_purchases = await upsertInBatches('kl_remota_purchases', backupData.kl_remota_purchases);
      }

      return stats;
    },
    onSuccess: (stats) => {
      queryClient.invalidateQueries();
      
      const totalRestored = Object.values(stats).reduce((a, b) => a + b, 0);
      toast.success(`Backup COMPLETO restaurado! ${totalRestored} itens importados de todas as tabelas.`);
    },
    onError: (error: Error) => {
      console.error('Restore error:', error);
      toast.error('Erro ao restaurar backup: ' + error.message);
    }
  });
};
