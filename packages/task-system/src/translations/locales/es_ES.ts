/**
 * Spanish translations for task-system module
 * Organized by namespaces for better organization and type safety
 */
const es_ES = {
  task: {
    dueBy: "VENCE A LAS",
    begin: "COMENZAR",
    resume: "REANUDAR",
    completed: "COMPLETADO",
    expired: "Vencido",
    loading: "Cargando tareas...",
    noTasks: "No hay tareas",
    today: "Hoy",
    dashboard: "Tablero",
    startsAt: "comienza a las",
  },
  activity: {
    required: "Requerido",
    noAnswerProvided: "No se proporcionó respuesta",
    notAnswered: "No respondido",
    answerQuestions: "Responder Preguntas",
  },
  common: {
    ok: "OK",
    cancel: "CANCELAR",
    back: "Atrás",
    next: "Siguiente",
    previous: "Anterior",
    submit: "Enviar",
    review: "Revisar",
    save: "Guardar",
    delete: "Eliminar",
    edit: "Editar",
    close: "Cerrar",
    loading: "Cargando...",
  },
  questions: {
    validationError: "Error de Validación",
    required: "Este campo es obligatorio.",
    invalidFormat: "El valor no coincide con el formato requerido",
    outOfRange: "El valor está fuera de rango",
    pleaseAnswerRequired:
      "Por favor responda todas las preguntas requeridas antes de continuar.",
    pleaseAnswerRequiredReview:
      "Por favor responda todas las preguntas requeridas antes de revisar.",
    notAnswered: "No respondido",
    addPhoto: "Agregar Foto",
    editPhoto: "Editar Foto",
  },
} as const;

export default es_ES;
