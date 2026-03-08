## توثيق الباك-إند (GYM SaaS)

### نظرة عامة
- مبني باستخدام Node.js/Express مع Mongoose للتعامل مع MongoDB.
- المصادقة JWT عبر هيدر `Authorization: Bearer <token>`.
- أغلب المسارات تتطلب `authenticate` وبعضها يتطلب `authorizeAdmin` أيضًا.
- البادئة العامة لكل الـ APIs: `/api`.

### تشغيل المشروع
- المتطلبات:
  - Node.js
  - MongoDB
- متغيرات البيئة (ملف `.env`):
  - `MONGO_URI`: رابط اتصال MongoDB
  - `JWT_SECRET`: السر الخاص بتوقيع وتحقيق الـ JWT
  - `PORT` (اختياري، افتراضي 3000)
  - `CLOUDINARY_CLOUD_NAME`: اسم الحساب في Cloudinary
  - `CLOUDINARY_API_KEY`: مفتاح API من Cloudinary
  - `CLOUDINARY_API_SECRET`: سر API من Cloudinary
  - `CLOUDINARY_FOLDER` (اختياري): مجلد افتراضي لرفع الملفات
- أوامر:
  - تشغيل: `npm run start`
  - تطوير: `npm run dev`

### المصادقة والصلاحيات
- `authenticate`: تقرأ JWT من هيدر `Authorization` وتحقّق منه وتحقن `req.user`.
- `authorizeAdmin`: تتحقق أن `req.user.role === 'admin'`.
- يوجد أيضًا `authorizeRole(roles[])` لتقييد الوصول بناءً على أدوار محددة (غير مستخدمة حاليًا في الروتس).

### تنسيق الاستجابات والأخطاء
- يوجد معالج أخطاء عام يعيد:
  - `{ success: false, message, stack? }` مع كود الحالة المناسب.
- بعض قوائم الفاينانس تعيد `{ count, results }`. لا يوجد تنسيق موحّد لكل الاستجابات عبر المشروع.

### الاتصال بقاعدة البيانات
- يتم الاتصال عبر `backend/src/config/index.js` باستخدام `process.env.MONGO_URI`.
- يتم استدعاء `connectDB()` في `server.js` قبل تفعيل السيرفر.

### الموديلات (ملخص عالي المستوى)
- `User`: بيانات المستخدم الأساسية + أدوار + بعض حقول الاشتراك الأساسية.
- `userMangment`:
  - `Payment`: دفعات المستخدم (`userId`, `amount`, `date`, `method`, `notes`).
  - `Purchase`: مشتريات المستخدم (`userId`, `itemName`, `price`, `date`).
- `FinancialManagement`:
  - `Revenue`: دخل (`amount`, `date`, `paymentMethod`, `sourceType`, `userId`, `notes`). فهارس على: `date`, `userId`, `sourceType`.
  - `Expense`: مصروف (`amount`, `date`, `category`, `paidTo`, `notes`). فهارس على: `date`, `category`.
  - `Invoice`: فاتورة (`invoiceNumber` unique, `userId`, `amount`, `issueDate`, `dueDate`, `status`, `items[]`, `notes`). فهارس على: `invoiceNumber`, `issueDate`, `userId`, `status`.
  - `Payroll`: مرتبات (`employeeId`, `salaryAmount`, `paymentDate`, `bonuses`, `deductions`, `notes`). فهارس على: `paymentDate`, `employeeId`.

### الفاليديشن
- موجودة في `backend/src/validators` ومربوطة في الروتس:
  - `financial.validator.js`: تحقق من معلمات البحث/الملخص الموحد (type/sort/dates/amounts).
  - `revenue.validator.js`: إنشاء/قائمة الدخل.
  - `expense.validator.js`: إنشاء/قائمة المصروف.
  - `invoice.validator.js`: إنشاء/قائمة الفواتير.
  - `payroll.validator.js`: إنشاء/قائمة المرتبات.

### ملفات مساعدة مهمة
- `auth.middleware.js`: `authenticate`, `authorizeAdmin`.
- `role.middleware.js`: `authorizeRole(roles)`.
- `error.middleware.js`: معالج أخطاء عام.
- `utils/jwt.util.js`: توليد/التحقق من JWT.

## المسارات (Endpoints)

### Auth
- POST `/api/auth/register`: تسجيل مستخدم جديد.
- POST `/api/auth/login`: تسجيل الدخول وإرجاع JWT.
- الحماية: لا تتطلب مصادقة.

### Users
- GET `/api/users/`: قائمة المستخدمين. حماية: أدمن.
- GET `/api/users/:id`: مستخدم محدد. حماية: أدمن.
- PUT `/api/users/role`: تحديث دور مستخدم. حماية: أدمن.
- PUT `/api/users/:id`: تحديث بيانات مستخدم. حماية: أدمن.
- DELETE `/api/users/:id`: حذف منطقي. حماية: أدمن.
- DELETE `/api/users/:id/hard`: حذف نهائي. حماية: أدمن.

### Attendance Records
- POST `/api/attendance/`: إنشاء سجل حضور. حماية: أدمن.
- GET `/api/attendance/`: كل السجلات. حماية: أدمن.
- GET `/api/attendance/:userId`: سجلات مستخدم. حماية: أدمن.
- PUT `/api/attendance/:id`: تحديث سجل. حماية: أدمن.
- DELETE `/api/attendance/:id`: حذف سجل. حماية: أدمن.

### Client Progress
- POST `/api/progress/`: إنشاء سجل تقدم. حماية: أدمن.
- GET `/api/progress/`: كل السجلات. حماية: أدمن.
- GET `/api/progress/:userId`: سجلات مستخدم. حماية: أدمن.
- PUT `/api/progress/:id`: تحديث. حماية: أدمن.
- DELETE `/api/progress/:id`: حذف. حماية: أدمن.

### Workout Plans
- POST `/api/workout-plans/:userId`: إنشاء خطة تمرين. حماية: أدمن.
- GET `/api/workout-plans/:userId`: خطط مستخدم. حماية: أدمن.
- GET `/api/workout-plans/plan/:id`: خطة بالمعرف. حماية: أدمن.
- PUT `/api/workout-plans/:id`: تحديث خطة. حماية: أدمن.
- DELETE `/api/workout-plans/:id`: حذف خطة. حماية: أدمن.
- GET `/api/workout-plans/`: كل الخطط. حماية: أدمن.
- التمارين داخل الخطة:
  - GET `/api/workout-plans/:planId/exercises`
  - POST `/api/workout-plans/:planId/exercises`
  - PUT `/api/workout-plans/:planId/exercises/:exerciseIndex`
  - DELETE `/api/workout-plans/:planId/exercises/:exerciseIndex`

### Diet Plans
- الخطط:
  - POST `/api/diet-plans/`
  - GET `/api/diet-plans/:id` (خطة بالمعرف)
  - GET `/api/diet-plans/:userId` (خطط مستخدم)
  - PUT `/api/diet-plans/:id`
  - DELETE `/api/diet-plans/:id`
- الوجبات:
  - GET `/api/diet-plans/:planId/meals`
  - POST `/api/diet-plans/:planId/meals`
  - PUT `/api/diet-plans/:planId/meals/:mealId`
  - DELETE `/api/diet-plans/:planId/meals/:mealId`
  - GET `/api/diet-plans/meal/:mealId`
- الحماية: أدمن.

### Messages
- POST `/api/messages/`: إنشاء رسالة. حماية: `authenticate`.
- GET `/api/messages/`: جميع الرسائل. حماية: `authenticate`.
- GET `/api/messages/:userId`: رسائل مستخدم. حماية: `authenticate`.
- PUT `/api/messages/:id/read`: تحديث حالة القراءة. حماية: `authenticate`.
- DELETE `/api/messages/:id`: حذف. حماية: `authenticate`.

### Session Schedules
- POST `/api/schedules/:userId`: إنشاء حصة. حماية: أدمن.
- GET `/api/schedules/:userId`: حصص مستخدم. حماية: أدمن.
- GET `/api/schedules/`: جميع الحصص. حماية: أدمن.
- PUT `/api/schedules/:id`: تحديث. حماية: أدمن.
- DELETE `/api/schedules/:id`: حذف. حماية: أدمن.

### Feedback
- POST `/api/feedback/`: إضافة تقييم. حماية: `authenticate`.
- GET `/api/feedback/`: كل التقييمات. حماية: `authenticate`.
- GET `/api/feedback/:userId`: تقييمات مستخدم. حماية: `authenticate`.
- PUT `/api/feedback/:id`: تحديث. حماية: `authenticate`.
- DELETE `/api/feedback/:id`: حذف. حماية: `authenticate`.

### Rewards
- POST `/api/rewards/:userId`: إنشاء مكافأة لمستخدم. حماية: أدمن.
- GET `/api/rewards/`: كل المكافآت. حماية: أدمن.
- GET `/api/rewards/:userId`: مكافآت مستخدم. حماية: أدمن.
- PUT `/api/rewards/:id`: تحديث. حماية: أدمن.
- DELETE `/api/rewards/:id`: حذف. حماية: أدمن.

### Payments
- POST `/api/payments/`: إنشاء دفعة. حماية: أدمن.
- GET `/api/payments/`: جميع الدفعات. حماية: أدمن.
- GET `/api/payments/:userId`: دفعات مستخدم. حماية: أدمن.
- PUT `/api/payments/:id`: تحديث دفعة. حماية: أدمن.
- DELETE `/api/payments/:id`: حذف دفعة. حماية: أدمن.

### Purchases
- POST `/api/purchases/`: إنشاء عملية شراء. حماية: أدمن.
- GET `/api/purchases/`: كل المشتريات للمستخدم الحالي (يفترض استخدام `req.user.id`). حماية: أدمن.
- GET `/api/purchases/:id`: عملية شراء واحدة. حماية: أدمن.
- PUT `/api/purchases/:id`: تحديث. حماية: أدمن.
- DELETE `/api/purchases/:id`: حذف. حماية: أدمن.

### Finance (موحّد)
- GET `/api/financial/search`
  - يجمع نتائج من: `Revenue`, `Expense`, `Invoice`, `Payroll`, `Payment`, `Purchase`.
  - باراميترز: `type` (revenue|expense|invoice|payroll|payment|purchase|all), `userId`, `employeeId`, `invoiceNumber`, `status`, `category`, `sourceType`, `paymentMethod`, `minAmount`, `maxAmount`, `from`, `to`, `sort` (asc|desc), `limit`, `skip`.
  - استجابة: `{ count, results: [{ type, id, amount, date, ... }] }`.
  - حماية: أدمن.
- GET `/api/financial/summary`
  - يلخص دخل/مصروف شهريًا مع صافي الربح.
  - باراميترز: `from`, `to`, `sort`.
  - استجابة: `{ range, totals: { revenue, expense, netProfit }, monthly: [{year,month,revenue,expense,netProfit}] }`.
  - حماية: أدمن.

### Revenues
- POST `/api/finance/revenues`
  - body: `{ amount (required), date?, paymentMethod?, sourceType (required), userId?, notes? }`
- GET `/api/finance/revenues`
  - فلاتر: `userId`, `sourceType`, `paymentMethod`, `minAmount`, `maxAmount`, `from`, `to`, `sort`, `limit`, `skip`
  - استجابة: `{ count, results }`
- GET `/api/finance/revenues/summary`: تلخيص شهري للدخل.
- GET `/api/finance/revenues/:id`, PUT, DELETE.
- حماية: أدمن.

### Expenses
- POST `/api/finance/expenses`
  - body: `{ amount (required), date?, category (required), paidTo?, notes? }`
- GET `/api/finance/expenses`
  - فلاتر: `category`, `minAmount`, `maxAmount`, `from`, `to`, `sort`, `limit`, `skip`
  - استجابة: `{ count, results }`
- GET `/api/finance/expenses/summary`: تلخيص شهري للمصروف.
- GET `/api/finance/expenses/:id`, PUT, DELETE.
- حماية: أدمن.

### Invoices
- POST `/api/finance/invoices`
  - body: `{ invoiceNumber (required), userId (required), amount (required), issueDate?, dueDate?, status?, items?, notes? }`
- GET `/api/finance/invoices`
  - فلاتر: `userId`, `invoiceNumber`, `status`, `minAmount`, `maxAmount`, `from`, `to`, `sort`, `limit`, `skip`
  - استجابة: `{ count, results }`
- GET `/api/finance/invoices/summary`
  - تجميع شهري مع تقسيم حسب الحالة (paid/pending/overdue) مع الإجمالي الكلي.
- GET `/api/finance/invoices/:id`, PUT, DELETE.
- Hook: عند تحديث الحالة إلى `paid` يتم إنشاء `Revenue` تلقائيًا بقيمة الفاتورة وربطها بـ `userId`.
- حماية: أدمن.

### Payrolls
- POST `/api/finance/payrolls`
  - body: `{ employeeId (required), salaryAmount (required), paymentDate?, bonuses?, deductions?, notes? }`
- GET `/api/finance/payrolls`
  - فلاتر: `employeeId`, `minAmount`, `maxAmount`, `from`, `to`, `sort`, `limit`, `skip`
  - استجابة: `{ count, results }`
- GET `/api/finance/payrolls/summary`
  - تجميع شهري (إجمالي الرواتب والمكافآت والخصومات وصافي).
- GET `/api/finance/payrolls/:id`, PUT, DELETE.
- حماية: أدمن.

## Postman Collection
- الملف: `GYM-Financial.postman_collection.json`
- يحتوي على كل المسارات المالية (موحد/Revenue/Expense/Invoice/Payroll) مع متغيرات ديناميكية:
  - `baseUrl`, `token`, `userId`, `employeeId`, `fromDate`, `toDate`، ويتم حفظ المعرفات المنشأة تلقائيًا لاستخدامها لاحقًا.

## فهارس وأداء
- فهارس على الحقول كثيرة الاستعلام:
  - `Revenue`: `date`, `userId`, `sourceType`
  - `Expense`: `date`, `category`
  - `Invoice`: `invoiceNumber`, `issueDate`, `userId`, `status`
  - `Payroll`: `paymentDate`, `employeeId`

## ملاحظات تنفيذية وتحسينات مقترحة
- الأموال مخزنة كـ Number؛ إن لزم دقة أعلى يمكن استخدام `Decimal128`.
- يمكن إضافة Caching لإجريجيشن الـ summary (مثلًا 60 ثانية).
- سياسات اتساق البيانات: عند تعديل/حذف فاتورة مدفوعة، يمكن مزامنة `Revenue` المرتبط (تحديث/حذف).
- قابلية الإضافة لاحقًا:
  - Health endpoints (`/healthz`, `/readyz`)
  - Swagger/OpenAPI للتوثيق التفاعلي
  - Helmet + Rate limiting + CORS مقيد من الـ env
  - اختبارات Jest/Supertest للمسارات الحرجة


