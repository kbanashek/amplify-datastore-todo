export const TestIds = {
  globalHeaderMenuButton: "global_header_menu_button",
  navigationMenuItemSeedData: "navigation_menu_item_seed_data",

  seedScreenRoot: "seed_screen_root",
  seedScreenClearAllSeededDataButton:
    "seed_screen_clear_all_seeded_data_button",
  seedScreenClearAllTasksButton: "seed_screen_clear_all_tasks_button",
  seedScreenClearAllAppointmentsButton:
    "seed_screen_clear_all_appointments_button",
  seedScreenSeedCoordinatedButton: "seed_screen_seed_coordinated_button",
  seedScreenCoordinatedResultsSection:
    "seed_screen_coordinated_results_section",
  seedScreenBackToDashboardButton: "seed_screen_back_to_dashboard_button",

  devOptions: {
    scrollView: "dev_options_scroll_view",
    forceResync: "dev_options_force_resync",
    quickImport: "dev_options_quick_import",
    deleteTasks: "dev_options_delete_tasks",
    deleteAppointments: "dev_options_delete_appointments",
    nuclearDelete: "dev_options_nuclear_delete",
  },

  // New name (preferred)
  dashboardGroupedTasksView: "dashboard_grouped_tasks_view",
  // Back-compat alias (older name)
  dashboardTasksGroupedView: "dashboard_tasks_grouped_view",
  taskCardBeginButton: "task_card_begin_button",
  questionsScreenRoot: "questions_screen_root",
} as const;
