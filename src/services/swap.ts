import { useSupabase as useSupabaseConfig } from './config';
import { useSupabaseAuth } from './authService';
import { useSupabaseStudentService } from './studentService';
import { useSupabaseResourceService } from './resourceService';
import { useSupabaseAnnouncementService } from './announcementService';
import { useSupabaseSuggestionService } from './suggestionService';
import { useSupabaseAnalyticsService } from './analyticsService';
import { useSupabaseBirthdayService } from './birthdayService';
import { useSupabaseReceiptService } from './receiptService';
import { useSupabaseCourseService } from './courseService';
import { useSupabaseNotificationService } from './notificationService';
import { useSupabaseActivityService } from './activityService';

export function useSupabaseServices(): void {
  useSupabaseConfig();
  useSupabaseAuth();
  useSupabaseStudentService();
  useSupabaseResourceService();
  useSupabaseAnnouncementService();
  useSupabaseSuggestionService();
  useSupabaseAnalyticsService();
  useSupabaseBirthdayService();
  useSupabaseReceiptService();
  useSupabaseCourseService();
  useSupabaseNotificationService();
  useSupabaseActivityService();
  console.log('[Services] Switched to Supabase provider');
}
