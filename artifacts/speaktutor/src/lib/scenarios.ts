export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Scenario = {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  emoji: string;
  category: string;
  difficulty: Difficulty;
  durationMinutes: number;
  role: string;
};

export const SCENARIOS: Scenario[] = [
  { id: "order_coffee",       title: "Заказать кофе",                   titleEn: "Order Coffee",              description: "Зайдите в кофейню и закажите свой любимый напиток.",                        emoji: "☕", category: "everyday",   difficulty: "beginner",     durationMinutes: 5,  role: "a friendly barista at a coffee shop" },
  { id: "order_pizza",        title: "Заказать пиццу",                  titleEn: "Order Pizza",               description: "Позвоните или зайдите в пиццерию и сделайте заказ.",                        emoji: "🍕", category: "everyday",   difficulty: "beginner",     durationMinutes: 5,  role: "a friendly pizza restaurant employee taking an order" },
  { id: "buy_water",          title: "Купить воду в магазине",           titleEn: "Buy Water at a Shop",       description: "Попросите воду у продавца и оплатите покупку.",                              emoji: "💧", category: "everyday",   difficulty: "beginner",     durationMinutes: 5,  role: "a shop assistant in a convenience store" },
  { id: "ask_directions",     title: "Спросить дорогу",                 titleEn: "Ask for Directions",        description: "Попросите прохожего показать, как добраться до нужного места.",               emoji: "🗺️", category: "travel",     difficulty: "beginner",     durationMinutes: 6,  role: "a helpful local person giving directions on the street" },
  { id: "introduce_yourself", title: "Познакомиться",                   titleEn: "Introduce Yourself",        description: "Расскажите о себе: имя, откуда, чем занимаетесь.",                           emoji: "👋", category: "everyday",   difficulty: "beginner",     durationMinutes: 6,  role: "a friendly new acquaintance meeting the student for the first time" },
  { id: "buy_bus_ticket",     title: "Купить автобусный билет",          titleEn: "Buy a Bus Ticket",          description: "Купите билет на автобус до нужного города или остановки.",                   emoji: "🚌", category: "travel",     difficulty: "beginner",     durationMinutes: 5,  role: "a bus station ticket agent" },
  { id: "ask_price",          title: "Узнать цену",                     titleEn: "Ask the Price",             description: "Уточните стоимость товара или услуги в магазине.",                           emoji: "🏷️", category: "everyday",   difficulty: "beginner",     durationMinutes: 5,  role: "a shop assistant helping a customer check prices" },
  { id: "hotel_checkin",      title: "Заселение в отель",               titleEn: "Hotel Check-in",            description: "Пройдите регистрацию на ресепшене и узнайте всё о номере.",                  emoji: "🏨", category: "travel",     difficulty: "beginner",     durationMinutes: 7,  role: "a polite hotel receptionist checking in a guest" },
  { id: "say_what_you_like",  title: "Рассказать о хобби",              titleEn: "Talk About Your Hobbies",   description: "Поделитесь тем, что вам нравится делать в свободное время.",                  emoji: "🎨", category: "everyday",   difficulty: "beginner",     durationMinutes: 6,  role: "a friendly person getting to know the student's hobbies" },
  { id: "meet_new_friend",    title: "Познакомиться с другом",           titleEn: "Meet a New Friend",         description: "Заведите непринуждённую беседу и узнайте о новом знакомом.",                 emoji: "🤝", category: "everyday",   difficulty: "beginner",     durationMinutes: 7,  role: "a new acquaintance at a social gathering making conversation" },
  { id: "buy_painting",       title: "Купить картину в галерее",         titleEn: "Buy a Painting",            description: "Поговорите с куратором и выберите произведение искусства.",                  emoji: "🖼️", category: "everyday",   difficulty: "intermediate", durationMinutes: 9,  role: "an art gallery curator helping a customer choose a painting" },
  { id: "return_item",        title: "Вернуть товар",                   titleEn: "Return an Item",            description: "Объясните причину возврата и договоритесь об обмене или возврате денег.",    emoji: "🔄", category: "everyday",   difficulty: "intermediate", durationMinutes: 8,  role: "a customer service representative handling a product return" },
  { id: "book_restaurant",    title: "Забронировать столик",            titleEn: "Book a Table",              description: "Позвоните в ресторан, выберите время и уточните пожелания.",                 emoji: "🍽️", category: "everyday",   difficulty: "intermediate", durationMinutes: 7,  role: "a restaurant host taking a reservation by phone" },
  { id: "phone_problem",      title: "Проблема с телефоном",            titleEn: "Explain a Phone Problem",   description: "Опишите неисправность телефона и попросите помощи в сервисе.",                emoji: "📱", category: "business",   difficulty: "intermediate", durationMinutes: 9,  role: "a phone repair shop technician assisting a customer" },
  { id: "rent_apartment",     title: "Снять квартиру",                  titleEn: "Rent an Apartment",         description: "Поговорите с арендодателем об условиях аренды.",                            emoji: "🏠", category: "everyday",   difficulty: "intermediate", durationMinutes: 10, role: "a landlord showing an apartment to a potential tenant" },
  { id: "doctor_symptoms",    title: "Визит к врачу",                   titleEn: "Visit a Doctor",            description: "Опишите самочувствие и получите рекомендации на английском.",               emoji: "🏥", category: "healthcare", difficulty: "intermediate", durationMinutes: 9,  role: "a doctor listening to a patient's symptoms and giving medical advice" },
  { id: "travel_plans",       title: "Обсудить поездку",                titleEn: "Discuss Travel Plans",      description: "Расскажите агенту о маршруте мечты и уточните детали.",                     emoji: "✈️", category: "travel",     difficulty: "intermediate", durationMinutes: 10, role: "a travel agent helping a customer plan their dream trip" },
  { id: "airport_help",       title: "Помощь в аэропорту",              titleEn: "Help at the Airport",       description: "Разберитесь с посадкой, багажом или задержкой рейса.",                      emoji: "🛫", category: "travel",     difficulty: "intermediate", durationMinutes: 8,  role: "an airport staff member helping a confused traveler" },
  { id: "small_discount",     title: "Попросить скидку",                titleEn: "Negotiate a Discount",      description: "Вежливо попросите о скидке при покупке товара или услуги.",                  emoji: "💸", category: "business",   difficulty: "intermediate", durationMinutes: 7,  role: "a shop manager considering a discount request from a customer" },
  { id: "phone_appointment",  title: "Записаться по телефону",          titleEn: "Make an Appointment",       description: "Позвоните в клинику или организацию и договоритесь о встрече.",              emoji: "📞", category: "business",   difficulty: "intermediate", durationMinutes: 7,  role: "a receptionist at a clinic scheduling an appointment by phone" },
  { id: "hotel_budget",       title: "Отель с фиксированным бюджетом",  titleEn: "Hotel on a Budget",         description: "Договоритесь о лучшей цене на ночной заезд с ограниченным бюджетом.",        emoji: "🌙", category: "travel",     difficulty: "advanced",     durationMinutes: 12, role: "a hotel front desk manager negotiating room rates with a budget-conscious guest" },
  { id: "job_interview",      title: "Собеседование",                   titleEn: "Job Interview",             description: "Пройдите интервью: расскажите об опыте, навыках и мотивации.",               emoji: "💼", category: "interview",  difficulty: "advanced",     durationMinutes: 15, role: "an HR manager conducting a professional job interview in English" },
  { id: "business_meeting",   title: "Деловое совещание",               titleEn: "Business Meeting",          description: "Проведите переговоры: обсудите проект, сроки и условия.",                    emoji: "📊", category: "business",   difficulty: "advanced",     durationMinutes: 15, role: "a business client negotiating project terms and timeline" },
  { id: "complain_service",   title: "Пожаловаться на сервис",          titleEn: "Complain About Service",    description: "Вежливо, но настойчиво выразите недовольство и добейтесь решения.",          emoji: "😤", category: "everyday",   difficulty: "advanced",     durationMinutes: 10, role: "a customer service manager handling a formal complaint" },
  { id: "tech_support",       title: "Техническая поддержка",           titleEn: "Technical Support",         description: "Опишите сложную техническую проблему оператору поддержки.",                 emoji: "💻", category: "business",   difficulty: "advanced",     durationMinutes: 10, role: "a senior tech support specialist troubleshooting a complex issue" },
  { id: "contract_terms",     title: "Переговоры по контракту",         titleEn: "Contract Negotiations",     description: "Обсудите ключевые пункты договора и отстаивайте свои интересы.",             emoji: "📝", category: "business",   difficulty: "advanced",     durationMinutes: 15, role: "a lawyer or business partner reviewing and negotiating contract terms" },
  { id: "startup_pitch",      title: "Питч стартапа",                   titleEn: "Startup Pitch",             description: "Презентуйте идею инвестору и убедите его в перспективности проекта.",       emoji: "🚀", category: "business",   difficulty: "advanced",     durationMinutes: 12, role: "a venture capital investor listening to and questioning a startup pitch" },
  { id: "salary_talk",        title: "Переговоры о зарплате",           titleEn: "Salary Negotiation",        description: "Грамотно обсудите вознаграждение с HR-менеджером.",                         emoji: "💰", category: "interview",  difficulty: "advanced",     durationMinutes: 10, role: "an HR manager discussing salary expectations with a candidate" },
  { id: "travel_emergency",   title: "Экстренная ситуация в поездке",   titleEn: "Travel Emergency",          description: "Справьтесь с форс-мажором: потеря паспорта, болезнь, ЧП.",                  emoji: "🆘", category: "travel",     difficulty: "advanced",     durationMinutes: 12, role: "an embassy official or emergency services representative helping a traveler" },
  { id: "change_flight",      title: "Изменить рейс",                   titleEn: "Change a Flight",           description: "Позвоните в авиакомпанию, объясните причину и перебронируйте рейс.",        emoji: "🛩️", category: "travel",     difficulty: "advanced",     durationMinutes: 10, role: "an airline customer service agent handling a flight change request" },
];

export const CATEGORY_LABELS: Record<string, string> = {
  all: "Все", everyday: "Повседневные", travel: "Путешествия",
  business: "Бизнес", interview: "Собеседование", healthcare: "Здоровье",
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Начинающий", intermediate: "Средний", advanced: "Продвинутый",
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  intermediate: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  advanced: "bg-destructive/10 text-destructive border-destructive/20",
};

export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
