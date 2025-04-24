  <h1>🏠 Property Rental & Booking Platform Backend</h1>
  <p>A feature-rich NestJS backend for managing properties, bookings, media, and payments for a property rental and management platform.</p>

  <h2>🚀 Features</h2>
  <ul>
    <li><strong>🔐 Authentication & Authorization:</strong> JWT-based user authentication and role-based access control.</li>
    <li><strong>🏡 Property Management:</strong> CRUD, approval system, pricing, media management, and availability filtering.</li>
    <li><strong>🗕️ Booking Management:</strong> Flexible durations, conflict checks, and availability tracking.</li>
    <li><strong>💵 Payments (Paystack):</strong> Payment initialization, status tracking, and secure flow.</li>
    <li><strong>📋 Promotions:</strong> Promo code support with different scopes (property, lister, global).</li>
    <li><strong>📦 Media:</strong> Cloudinary-based upload with public/private control and signed URLs.</li>
  </ul>

  <h2>🧱 Tech Stack</h2>
  <ul>
    <li><strong>Framework:</strong> NestJS</li>
    <li><strong>Database:</strong> PostgreSQL with TypeORM</li>
    <li><strong>Cloud Storage:</strong> Cloudinary</li>
    <li><strong>Payments:</strong> Paystack</li>
    <li><strong>Auth:</strong> JWT</li>
  </ul>

  <h2>📂 Project Structure</h2>
  <pre><code>src/
├── auth/            # Auth & JWT logic
├── bookings/        # Booking logic & availability
├── payments/        # Paystack payment integration
├── media/           # Cloudinary media uploads
├── properties/      # Property CRUD, pricing, approvals
├── common/          # Shared logic and decorators
├── entities/        # TypeORM entities
├── config/          # Environment configuration</code></pre>

  <h2>⚙️ Setup & Installation</h2>
  <h3>1. Clone the repo</h3>
  <pre><code>git clone https://github.com/yourusername/property-rental-backend.git
cd property-rental-backend</code></pre>

  <h3>2. Install dependencies</h3>
  <pre><code>yarn install</code></pre>

  <h3>3. Create <code>.env</code> file</h3>
  <pre><code>DATABASE_URL=postgres://user:password@localhost:5432/dbname
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
PAYSTACK_SECRET=your_paystack_secret</code></pre>

<h2>✅ TODO</h2>
  <ul>
    <li>Email notifications</li>
    <li>Booking reminders</li>
    <li>Admin dashboard metrics</li>
    <li>Wallet/refund system</li>
  </ul>

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
