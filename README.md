# CQRS with Clean Architecture in .NET 10

Welcome to the **Design Pattern CQRS (.NET 10)** learning repository! This project serves as an enterprise-grade, beginner-friendly showcase of **Command Query Responsibility Segregation (CQRS)** implemented with **Clean Architecture** in ASP.NET Core Web API, using PostgreSQL, MediatR, FluentValidation, AutoMapper, and Scalar.

---

## 📖 Table of Contents
1. [What is CQRS?](#-what-is-cqrs)
2. [Why use CQRS?](#-why-use-cqrs)
3. [The CQRS Request Flow](#-the-cqrs-request-flow)
4. [Project Architecture Structure](#-project-architecture-structure)
5. [Tech Stack](#-tech-stack)
6. [NuGet Packages Installed](#-nuget-packages-installed)
7. [Getting Started & Running the Project](#-getting-started--running-the-project)
8. [Example API Requests & Responses](#-example-api-requests--responses)

---

## 🧠 What is CQRS?

**CQRS** stands for **Command Query Responsibility Segregation**. 

At its core, CQRS separates the operations that **write data** (Commands) from the operations that **read data** (Queries).
*   **Command (Write)**: Modifies the state of the application (Insert, Update, Delete). It returns no data, or a simple identifier (e.g., the Guid of the created entity).
*   **Query (Read)**: Reads data from the database and returns a DTO (Data Transfer Object) or model. It never modifies the state of the system.

---

## 🎯 Why use CQRS?

1.  **Separation of Concerns**: Read and write operations have different scaling, performance, and formatting requirements. CQRS allows you to optimize them independently.
2.  **Optimized Performance & Scaling**: Read workloads are often vastly different from write workloads. You can optimize database indexes or even use separate read/write replicas.
3.  **Single Responsibility Principle (SRP)**: In traditional CRUD, service classes become bloated with dozens of unrelated methods. In CQRS, every action is encapsulated in its own Command or Query file, making code highly maintainable and clean.
4.  **Pipeline Behaviors**: Cross-cutting concerns like validation, logging, performance monitoring, and caching can be applied globally across the MediatR request pipeline.

---

## 🔄 The CQRS Request Flow

This repository demonstrates the direct flow of requests through the system:

```
[ HTTP Client ]
      │
      ▼  (HTTP POST/GET)
[ Controllers ] (UsersController)
      │
      ▼  (Sends command/query payload)
[ MediatR Pipeline ] ────────► LoggingBehavior ──► ValidationBehavior
      │
      ▼  (Dispatches to registered handler)
[ Handlers ] (CreateUserCommandHandler)
      │
      ▼  (Calls repository contracts)
[ Repositories / Unit of Work ] (UserRepository)
      │
      ▼  (EF Core / Npgsql)
[ PostgreSQL Database ]
```

---

## 🏗️ Project Architecture Structure

We use **Clean Architecture** to ensure that business logic does not depend on database or presentation frameworks.

```
src/
 ├── DesignPattern.CQRS.Domain           # Core Enterprise Entities & Exceptions
 │    ├── Common/BaseEntity.cs           # Entity base metadata (Id, CreatedAt)
 │    ├── Entities/User.cs               # Simple User business model
 │    └── Exceptions/                    # NotFound & Validation Custom Exceptions
 │
 ├── DesignPattern.CQRS.Application      # Application Use Cases & Core Interfaces
 │    ├── Interfaces/                    # IUserRepository, IUnitOfWork contracts
 │    ├── Behaviors/                     # MediatR Logging & Validation behaviors
 │    ├── DTOs/                          # Read DTOs (UserDto, PaginatedList)
 │    ├── Mappings/                      # AutoMapper Profile mapping
 │    ├── DependencyInjection.cs         # Registration helper for MediatR & behaviors
 │    └── Features/Users/                # User Module sliced vertically
 │         ├── Commands/                 # Create, Update, Delete commands and handlers
 │         └── Queries/                  # GetById, GetAll queries and handlers
 │
 ├── DesignPattern.CQRS.Infrastructure   # Data persistence & external integrations
 │    ├── Persistence/                   # ApplicationDbContext & PostgreSQL configs
 │    ├── Repositories/                  # UserRepository & UnitOfWork implementations
 │    └── DependencyInjection.cs         # DbContext & Repository DI setups
 │
 └── DesignPattern.CQRS.Api              # Web API Presentation Layer
      ├── Controllers/                   # UsersController REST endpoints
      ├── Middlewares/                   # RFC 7807 Exception handling
      └── Program.cs                     # API startup & Scalar configurations
```

---

## 🛠️ Tech Stack

*   **Runtime**: .NET 10.0
*   **Web Framework**: ASP.NET Core Web API
*   **Mediator Pattern**: MediatR
*   **Database**: PostgreSQL
*   **ORM**: Entity Framework Core
*   **Validation**: FluentValidation
*   **Object Mapping**: AutoMapper
*   **Logging**: Serilog
*   **API Reference / UI Docs**: Scalar (Modern API reference UI replacing classic Swagger)

---

## 📦 NuGet Packages Installed

| Project | Package Name | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Application** | `MediatR` | `14.1.0` | In-memory message dispatching |
| **Application** | `FluentValidation.DependencyInjectionExtensions` | `12.1.1` | Input model validation |
| **Application** | `AutoMapper` | `13.0.1` | Entity to DTO mapping |
| **Infrastructure** | `Microsoft.EntityFrameworkCore` | `10.0.8` | Core ORM framework |
| **Infrastructure** | `Microsoft.EntityFrameworkCore.Design` | `10.0.8` | EF Design support |
| **Infrastructure** | `Npgsql.EntityFrameworkCore.PostgreSQL` | `10.0.1` | PostgreSQL database provider |
| **Api** | `Microsoft.AspNetCore.OpenApi` | `10.0.8` | Native OpenAPI document generator |
| **Api` | `Scalar.AspNetCore` | `2.14.14` | Modern interactive API Explorer |
| **Api` | `Serilog.AspNetCore` | `9.0.0` | Fully featured structured logging |

---

## 🚀 Getting Started & Running the Project

### Prerequisites
1. Install **.NET 10 SDK**.
2. Have a running instance of **PostgreSQL**.

### 1. Database Connection Configuration
Open `src/DesignPattern.CQRS.Api/appsettings.json` and update the ConnectionString to point to your PostgreSQL server:
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=design_pattern_cqrs_db;Username=your_username;Password=your_password"
}
```

### 2. Apply Database Migrations
Run the following EF Core migration commands inside the root workspace folder:

```powershell
# Installs EF CLI tools if not already present
dotnet tool install --global dotnet-ef

# Applies migrations to create the database and user table
dotnet ef database update --project src/DesignPattern.CQRS.Infrastructure --startup-project src/DesignPattern.CQRS.Api
```

### 3. Run the Web API
Start the presentation layer using:
```powershell
dotnet run --project src/DesignPattern.CQRS.Api
```

Once running, navigate to:
*   **Scalar Interactive UI**: `https://localhost:<port>/scalar/v1`
*   **OpenAPI Document**: `https://localhost:<port>/openapi/v1.json`

---

## 📡 Example API Requests & Responses

### 1. Create User (Command)
*   **Method**: `POST`
*   **URL**: `/api/users`
*   **Body**:
    ```json
    {
      "name": "Jane Doe",
      "email": "jane.doe@example.com"
    }
    ```
*   **Response** (`201 Created`):
    ```json
    "83a6b579-2475-4752-b883-2070f61d2d3e"
    ```

### 2. Get User By ID (Query)
*   **Method**: `GET`
*   **URL**: `/api/users/83a6b579-2475-4752-b883-2070f61d2d3e`
*   **Response** (`200 OK`):
    ```json
    {
      "id": "83a6b579-2475-4752-b883-2070f61d2d3e",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "createdAt": "2026-05-19T14:30:00.12567+05:30"
    }
    ```

### 3. Get All Users with Pagination (Query)
*   **Method**: `GET`
*   **URL**: `/api/users?pageNumber=1&pageSize=5`
*   **Response** (`200 OK`):
    ```json
    {
      "items": [
        {
          "id": "83a6b579-2475-4752-b883-2070f61d2d3e",
          "name": "Jane Doe",
          "email": "jane.doe@example.com",
          "createdAt": "2026-05-19T14:30:00.12567+05:30"
        }
      ],
      "pageNumber": 1,
      "totalPages": 1,
      "totalCount": 1,
      "hasPreviousPage": false,
      "hasNextPage": false
    }
    ```

### 4. Validation Error Handling
*   **Method**: `POST`
*   **URL**: `/api/users`
*   **Body**:
    ```json
    {
      "name": "",
      "email": "invalid-email"
    }
    ```
*   **Response** (`400 Bad Request`):
    ```json
    {
      "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
      "title": "Validation Error",
      "status": 400,
      "detail": "One or more validation failures have occurred.",
      "errors": {
        "Name": [
          "Name is required."
        ],
        "Email": [
          "A valid email address is required."
        ]
      }
    }
    ```

### 5. Not Found Exception Handling
*   **Method**: `GET`
*   **URL**: `/api/users/00000000-0000-0000-0000-000000000000`
*   **Response** (`404 Not Found`):
    ```json
    {
      "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
      "title": "Not Found",
      "status": 404,
      "detail": "Entity \"User\" (00000000-0000-0000-0000-000000000000) was not found."
    }
    ```
