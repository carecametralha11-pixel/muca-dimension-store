import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface BackupData {
  version: string;
  created_at: string;
  cards: any[];
  card_mixes: any[];
  consultaveis: any[];
  consultavel_images: any[];
  module_descriptions: any[];
  module_media: any[];
  feedbacks: any[];
  user_balances: any[];
  profiles: any[];
  pix_payments: any[];
  purchases: any[];
}

// Helper function to fetch all records from a table (handles pagination for >1000 records)
async function fetchAllFromTable(tableName: 'cards' | 'card_mixes' | 'consultaveis' | 'consultavel_images' | 'module_descriptions' | 'module_media' | 'feedbacks' | 'user_balances' | 'profiles' | 'pix_payments' | 'purchases'): Promise<any[]> {
  const allData: any[] = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(from, from + pageSize - 1);

    if (error) throw error;

    if (data && data.length > 0) {
      allData.push(...data);
      from += pageSize;
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }

  return allData;
}

export const useCreateBackup = () => {
  return useMutation({
    mutationFn: async (): Promise<BackupData> => {
      toast.info('Criando backup... Aguarde.');

      // Fetch all data from all tables with pagination support
      const [
        cards,
        cardMixes,
        consultaveis,
        consultavelImages,
        moduleDescriptions,
        moduleMedia,
        feedbacks,
        userBalances,
        profiles,
        pixPayments,
        purchases
      ] = await Promise.all([
        fetchAllFromTable('cards'),
        fetchAllFromTable('card_mixes'),
        fetchAllFromTable('consultaveis'),
        fetchAllFromTable('consultavel_images'),
        fetchAllFromTable('module_descriptions'),
        fetchAllFromTable('module_media'),
        fetchAllFromTable('feedbacks'),
        fetchAllFromTable('user_balances'),
        fetchAllFromTable('profiles'),
        fetchAllFromTable('pix_payments'),
        fetchAllFromTable('purchases')
      ]);

      const backupData: BackupData = {
        version: '2.0',
        created_at: new Date().toISOString(),
        cards,
        card_mixes: cardMixes,
        consultaveis,
        consultavel_images: consultavelImages,
        module_descriptions: moduleDescriptions,
        module_media: moduleMedia,
        feedbacks,
        user_balances: userBalances,
        profiles,
        pix_payments: pixPayments,
        purchases
      };

      return backupData;
    },
    onSuccess: (data) => {
      // Create and download the backup file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-completo-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      const totalItems = 
        data.cards.length + 
        data.card_mixes.length + 
        data.consultaveis.length + 
        data.consultavel_images.length +
        data.feedbacks.length +
        data.profiles.length +
        data.purchases.length;
      
      toast.success(`Backup completo criado! ${totalItems} itens exportados.`);
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
      // Validate backup file - check if it has any recognizable data
      const hasContent = backupData.cards?.length || 
                         backupData.card_mixes?.length || 
                         backupData.consultaveis?.length ||
                         backupData.module_media?.length ||
                         backupData.module_descriptions?.length;
      
      if (!hasContent) {
        throw new Error('Arquivo de backup inválido ou vazio');
      }

      toast.info('Restaurando backup... Aguarde. (Ignorando dados de usuários)');

      const stats = {
        cards: 0,
        card_mixes: 0,
        consultaveis: 0,
        consultavel_images: 0,
        module_descriptions: 0,
        module_media: 0,
        feedbacks: 0
      };

      // Helper function to safely upsert data in batches
      // IGNORING: profiles, user_balances, pix_payments, purchases (user-specific data)
      type TableName = 'cards' | 'card_mixes' | 'consultaveis' | 'consultavel_images' | 'module_descriptions' | 'module_media' | 'feedbacks';
      
      async function upsertInBatches(tableName: TableName, data: any[], batchSize = 50): Promise<number> {
        if (!data || data.length === 0) return 0;

        let count = 0;
        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize).map(item => {
            // Remove any user-specific fields that might cause issues
            const cleanItem = { ...item };
            // Keep the id for upsert to work
            return cleanItem;
          });
          
          try {
            const { error } = await supabase
              .from(tableName)
              .upsert(batch, { onConflict: 'id', ignoreDuplicates: false });
            
            if (error) {
              console.warn(`Warning upserting to ${tableName}:`, error);
              // Continue with other batches instead of failing completely
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

      // Restore content data only (IGNORING user-specific data: profiles, user_balances, pix_payments, purchases)
      console.log('Restaurando backup - ignorando profiles e dados de usuário');
      
      // 1. Cards (products)
      if (backupData.cards && backupData.cards.length > 0) {
        console.log(`Restaurando ${backupData.cards.length} cards...`);
        stats.cards = await upsertInBatches('cards', backupData.cards);
      }

      // 2. Card mixes
      if (backupData.card_mixes && backupData.card_mixes.length > 0) {
        console.log(`Restaurando ${backupData.card_mixes.length} card mixes...`);
        stats.card_mixes = await upsertInBatches('card_mixes', backupData.card_mixes);
      }

      // 3. Consultaveis
      if (backupData.consultaveis && backupData.consultaveis.length > 0) {
        console.log(`Restaurando ${backupData.consultaveis.length} consultaveis...`);
        stats.consultaveis = await upsertInBatches('consultaveis', backupData.consultaveis);
      }

      // 4. Consultavel images (depends on consultaveis)
      if (backupData.consultavel_images && backupData.consultavel_images.length > 0) {
        console.log(`Restaurando ${backupData.consultavel_images.length} consultavel images...`);
        stats.consultavel_images = await upsertInBatches('consultavel_images', backupData.consultavel_images);
      }

      // 5. Module descriptions (CNH, KL REMOTA, NF descriptions)
      if (backupData.module_descriptions && backupData.module_descriptions.length > 0) {
        console.log(`Restaurando ${backupData.module_descriptions.length} module descriptions...`);
        stats.module_descriptions = await upsertInBatches('module_descriptions', backupData.module_descriptions);
      }

      // 6. Module media (photos and videos for CNH, KL REMOTA, NF)
      if (backupData.module_media && backupData.module_media.length > 0) {
        console.log(`Restaurando ${backupData.module_media.length} module media (fotos/vídeos)...`);
        stats.module_media = await upsertInBatches('module_media', backupData.module_media);
      }

      // 7. Feedbacks (public content)
      if (backupData.feedbacks && backupData.feedbacks.length > 0) {
        console.log(`Restaurando ${backupData.feedbacks.length} feedbacks...`);
        stats.feedbacks = await upsertInBatches('feedbacks', backupData.feedbacks);
      }

      // SKIPPED: profiles, user_balances, pix_payments, purchases
      // These are user-specific and should not be imported from external backups

      return stats;
    },
    onSuccess: (stats) => {
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
      
      const totalRestored = Object.values(stats).reduce((a, b) => a + b, 0);
      toast.success(`Backup restaurado! ${totalRestored} itens importados. (Dados de usuários foram ignorados)`);
    },
    onError: (error: Error) => {
      console.error('Restore error:', error);
      toast.error('Erro ao restaurar backup: ' + error.message);
    }
  });
};
