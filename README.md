# E-Pety Shop - System zamówień e-papierosów

Aplikacja webowa do zarządzania zamówieniami e-papierosów i olejków.

## Stack technologiczny

- **Backend:** Node.js + Express + TypeScript + Prisma
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Baza danych:** PostgreSQL
- **Hosting:** Railway

## Funkcje

### Panel Admina
- Dashboard z podsumowaniem (nowe zamówienia, niski stan magazynu)
- Zarządzanie klientami (tworzenie kont, reset haseł)
- Zarządzanie produktami z uploadem zdjęć
- Zarządzanie kategoriami
- Obsługa zamówień (zmiana statusów)

### Panel Klienta
- Przeglądanie produktów z filtrowaniem po kategoriach
- Koszyk z możliwością składania zamówień
- Historia zamówień

## Rozwój lokalny

### Wymagania
- Node.js 18+
- Docker (dla PostgreSQL)

### Uruchomienie

1. **Uruchom bazę danych:**
   ```bash
   docker-compose up -d
   ```

2. **Skonfiguruj backend:**
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npm run db:seed
   npm run dev
   ```

3. **Skonfiguruj frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Otwórz aplikację:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

### Domyślne dane logowania
- **Login:** admin
- **Hasło:** admin123

⚠️ Zmień hasło po pierwszym logowaniu!

## Deployment na Railway

### Backend

1. Połącz repozytorium z Railway
2. Dodaj PostgreSQL jako service
3. Ustaw zmienne środowiskowe:
   - `DATABASE_URL` - połączenie do PostgreSQL (Railway automatycznie)
   - `JWT_SECRET` - losowy string dla tokenów JWT
   - `CLOUDINARY_CLOUD_NAME` - nazwa cloud Cloudinary
   - `CLOUDINARY_API_KEY` - klucz API Cloudinary
   - `CLOUDINARY_API_SECRET` - sekret API Cloudinary

4. Build command: `npm run build && npx prisma migrate deploy`
5. Start command: `npm run start`

### Frontend

1. Dodaj nowy service dla frontendu
2. Ustaw zmienne środowiskowe:
   - `VITE_API_URL` - URL backendu na Railway

3. Build command: `npm run build`
4. Publish directory: `dist`

## Struktura projektu

```
zamowienie-epety/
├── backend/
│   ├── src/
│   │   ├── routes/         # Endpointy API
│   │   ├── middleware/     # Auth, upload
│   │   └── utils/          # Prisma client
│   └── prisma/             # Schemat bazy danych
├── frontend/
│   ├── src/
│   │   ├── pages/          # Strony aplikacji
│   │   ├── components/     # Komponenty React
│   │   ├── context/        # Auth, Cart context
│   │   └── api/            # Wywołania API
└── docker-compose.yml      # Lokalna baza danych
```

## API Endpoints

### Autoryzacja
- `POST /api/auth/login` - logowanie
- `GET /api/auth/me` - dane zalogowanego użytkownika

### Klienci (Admin)
- `GET /api/admin/customers` - lista klientów
- `POST /api/admin/customers` - dodaj klienta
- `PUT /api/admin/customers/:id` - edytuj klienta
- `PATCH /api/admin/customers/:id/password` - reset hasła
- `DELETE /api/admin/customers/:id` - usuń klienta

### Kategorie
- `GET /api/categories` - lista kategorii
- `POST /api/categories` - dodaj kategorię (Admin)
- `PUT /api/categories/:id` - edytuj kategorię (Admin)
- `DELETE /api/categories/:id` - usuń kategorię (Admin)

### Produkty
- `GET /api/products` - lista produktów
- `GET /api/products/:id` - szczegóły produktu
- `POST /api/products` - dodaj produkt (Admin)
- `PUT /api/products/:id` - edytuj produkt (Admin)
- `PATCH /api/products/:id/stock` - aktualizuj stan (Admin)
- `DELETE /api/products/:id` - usuń produkt (Admin)

### Zamówienia
- `GET /api/orders` - lista zamówień (własne lub wszystkie dla Admin)
- `GET /api/orders/:id` - szczegóły zamówienia
- `POST /api/orders` - złóż zamówienie
- `PATCH /api/orders/:id/status` - zmień status (Admin)
- `GET /api/orders/admin/stats` - statystyki (Admin)
