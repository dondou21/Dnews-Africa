import { OpenAPIV3 } from "openapi-types";

export const swaggerDoc: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "Dnews Africa API",
    version: "1.0.0",
    description: "REST API for the Dnews Africa news platform. Provides endpoints for articles, users, comments, categories, media, search, newsletter, contact, and dashboard analytics.",
  },
  servers: [
    { url: "http://localhost:4000/api/v1", description: "Development server" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          message: { type: "string", example: "Not found" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          avatarUrl: { type: "string", nullable: true },
          bio: { type: "string", nullable: true },
          isActive: { type: "boolean" },
          roleId: { type: "integer" },
          role: { $ref: "#/components/schemas/Role" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Role: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
        },
      },
      Article: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          slug: { type: "string" },
          summary: { type: "string" },
          content: { type: "string" },
          coverImageUrl: { type: "string", nullable: true },
          coverImageAlt: { type: "string", nullable: true },
          status: { type: "string", enum: ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "REJECTED", "ARCHIVED"] },
          isFeatured: { type: "boolean" },
          isTrending: { type: "boolean" },
          publishedAt: { type: "string", format: "date-time", nullable: true },
          category: { $ref: "#/components/schemas/Category" },
          author: { $ref: "#/components/schemas/UserBrief" },
          tags: {
            type: "array",
            items: { $ref: "#/components/schemas/ArticleTag" },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ArticleBrief: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          slug: { type: "string" },
          status: { type: "string" },
          category: { $ref: "#/components/schemas/Category" },
          author: { $ref: "#/components/schemas/UserBrief" },
          createdAt: { type: "string", format: "date-time" },
          publishedAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      ArticleTag: {
        type: "object",
        properties: {
          tag: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
              slug: { type: "string" },
            },
          },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          slug: { type: "string" },
          description: { type: "string", nullable: true },
        },
      },
      UserBrief: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          avatarUrl: { type: "string", nullable: true },
          bio: { type: "string", nullable: true },
        },
      },
      Comment: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          content: { type: "string" },
          status: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED"] },
          author: { $ref: "#/components/schemas/UserBrief" },
          guestName: { type: "string", nullable: true },
          guestEmail: { type: "string", nullable: true },
          article: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              slug: { type: "string" },
            },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Media: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          url: { type: "string" },
          alt: { type: "string", nullable: true },
          type: { type: "string", enum: ["IMAGE", "VIDEO", "DOCUMENT", "OTHER"] },
          fileSize: { type: "integer", nullable: true },
          width: { type: "integer", nullable: true },
          height: { type: "integer", nullable: true },
          uploadedBy: { $ref: "#/components/schemas/UserBrief" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      NewsletterSubscriber: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          name: { type: "string", nullable: true },
          isActive: { type: "boolean" },
          subscribedAt: { type: "string", format: "date-time" },
        },
      },
      ContactMessage: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          subject: { type: "string" },
          message: { type: "string" },
          isRead: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      DashboardResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "object",
            properties: {
              overview: { type: "object" },
              users: { type: "object" },
              articles: { type: "object" },
              comments: { type: "object" },
              newsletter: { type: "object" },
              contact: { type: "object" },
              media: { type: "object" },
              categories: { type: "object" },
              recentActivity: { type: "object" },
            },
          },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer" },
          limit: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },
    },
  },
  paths: {
    "/public/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    service: { type: "string", example: "Dnews Africa API" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/cms/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["firstName", "lastName", "email", "password"],
                properties: {
                  firstName: { type: "string", example: "John" },
                  lastName: { type: "string", example: "Doe" },
                  email: { type: "string", format: "email", example: "john@example.com" },
                  password: { type: "string", format: "password", minLength: 6, example: "securepass123" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "Email already in use", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "429": { description: "Too many requests" },
        },
      },
    },
    "/cms/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login and get JWT token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "john@example.com" },
                  password: { type: "string", format: "password", example: "securepass123" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: {
                      type: "object",
                      properties: {
                        token: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
                        user: { $ref: "#/components/schemas/User" },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "429": { description: "Too many requests" },
        },
      },
    },
    "/cms/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current user info",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "401": { description: "Authentication required" },
        },
      },
    },
    "/public/articles": {
      get: {
        tags: ["Articles"],
        summary: "List published articles",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 }, description: "Page number" },
          { in: "query", name: "limit", schema: { type: "integer", default: 10 }, description: "Items per page" },
          { in: "query", name: "sort", schema: { type: "string", enum: ["latest", "oldest", "title_asc", "title_desc"], default: "latest" } },
          { in: "query", name: "category", schema: { type: "string" }, description: "Filter by category slug" },
          { in: "query", name: "tag", schema: { type: "string" }, description: "Filter by tag slug" },
          { in: "query", name: "search", schema: { type: "string" }, description: "Search in title and summary" },
        ],
        responses: {
          "200": {
            description: "Paginated list of published articles",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: {
                      type: "object",
                      properties: {
                        articles: { type: "array", items: { $ref: "#/components/schemas/Article" } },
                        pagination: { $ref: "#/components/schemas/Pagination" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Articles"],
        summary: "Create an article",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "slug", "summary", "content", "categoryId"],
                properties: {
                  title: { type: "string", example: "Breaking News in Africa" },
                  slug: { type: "string", example: "breaking-news-in-africa" },
                  summary: { type: "string", example: "A short summary of the article" },
                  content: { type: "string", example: "Full article content here..." },
                  coverImageUrl: { type: "string", format: "uri", example: "https://example.com/image.jpg" },
                  coverImageAlt: { type: "string", example: "Image description" },
                  categoryId: { type: "integer", example: 1 },
                  status: { type: "string", enum: ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "REJECTED", "ARCHIVED"] },
                  isFeatured: { type: "boolean", default: false },
          isBreaking: { type: "boolean", default: false },
          allowComments: { type: "boolean", default: true },
                  isTrending: { type: "boolean", default: false },
                  tags: { type: "array", items: { type: "string" }, example: ["tech", "innovation"] },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Article created", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { $ref: "#/components/schemas/Article" } } } } } },
          "400": { description: "Validation error" },
          "401": { description: "Authentication required" },
          "403": { description: "Insufficient permissions" },
        },
      },
    },
    "/public/articles/featured": {
      get: {
        tags: ["Articles"],
        summary: "Get featured articles",
        responses: {
          "200": {
            description: "List of featured articles",
            content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { type: "array", items: { $ref: "#/components/schemas/Article" } } } } } },
          },
        },
      },
    },
    "/public/articles/latest": {
      get: {
        tags: ["Articles"],
        summary: "Get latest articles",
        responses: {
          "200": {
            description: "List of latest articles",
            content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { type: "array", items: { $ref: "#/components/schemas/Article" } } } } } },
          },
        },
      },
    },
    "/public/articles/{slug}": {
      get: {
        tags: ["Articles"],
        summary: "Get article by slug",
        parameters: [
          { in: "path", name: "slug", required: true, schema: { type: "string" }, description: "Article slug" },
        ],
        responses: {
          "200": { description: "Article details", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { $ref: "#/components/schemas/Article" } } } } } },
          "404": { description: "Article not found" },
        },
      },
    },
    "/public/articles/{id}": {
      patch: {
        tags: ["Articles"],
        summary: "Update an article",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" }, description: "Article ID" },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  slug: { type: "string" },
                  summary: { type: "string" },
                  content: { type: "string" },
                  coverImageUrl: { type: "string", format: "uri" },
                  categoryId: { type: "integer" },
                  status: { type: "string", enum: ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "REJECTED", "ARCHIVED"] },
                  isFeatured: { type: "boolean" },
                  isTrending: { type: "boolean" },
                  tags: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Article updated" },
          "401": { description: "Authentication required" },
          "403": { description: "Insufficient permissions" },
          "404": { description: "Article not found" },
        },
      },
      delete: {
        tags: ["Articles"],
        summary: "Delete an article",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" }, description: "Article ID" },
        ],
        responses: {
          "200": { description: "Article deleted" },
          "401": { description: "Authentication required" },
          "403": { description: "Insufficient permissions" },
          "404": { description: "Article not found" },
        },
      },
    },
    "/public/articles/{id}/comments": {
      get: {
        tags: ["Comments"],
        summary: "Get approved comments for an article",
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" }, description: "Article ID" },
        ],
        responses: {
          "200": {
            description: "List of approved comments",
            content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { type: "array", items: { $ref: "#/components/schemas/Comment" } } } } } },
          },
          "404": { description: "Article not found" },
        },
      },
      post: {
        tags: ["Comments"],
        summary: "Submit a comment on an article",
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" }, description: "Article ID" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "content"],
                properties: {
                  name: { type: "string", example: "Jane Doe" },
                  email: { type: "string", format: "email", example: "jane@example.com" },
                  content: { type: "string", example: "Great article! Thanks for sharing." },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Comment submitted for moderation", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { $ref: "#/components/schemas/Comment" } } } } } },
          "400": { description: "Cannot comment on unpublished articles or validation error" },
          "404": { description: "Article not found" },
        },
      },
    },
    "/public/categories": {
      get: {
        tags: ["Categories"],
        summary: "List all categories",
        responses: {
          "200": {
            description: "List of categories",
            content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { type: "array", items: { $ref: "#/components/schemas/Category" } } } } } },
          },
        },
      },
    },
    "/public/categories/{slug}": {
      get: {
        tags: ["Categories"],
        summary: "Get category by slug",
        parameters: [
          { in: "path", name: "slug", required: true, schema: { type: "string" }, description: "Category slug" },
        ],
        responses: {
          "200": { description: "Category details", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { $ref: "#/components/schemas/Category" } } } } } },
          "404": { description: "Category not found" },
        },
      },
    },
    "/public/categories/{slug}/articles": {
      get: {
        tags: ["Categories"],
        summary: "Get articles by category slug",
        parameters: [
          { in: "path", name: "slug", required: true, schema: { type: "string" }, description: "Category slug" },
        ],
        responses: {
          "200": {
            description: "Articles in category",
            content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { type: "array", items: { $ref: "#/components/schemas/ArticleBrief" } } } } } },
          },
          "404": { description: "Category not found" },
        },
      },
    },
    "/cms/users": {
      get: {
        tags: ["Users"],
        summary: "List all users (admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "List of users", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { type: "array", items: { $ref: "#/components/schemas/User" } } } } } } },
          "401": { description: "Authentication required" },
          "403": { description: "Insufficient permissions" },
        },
      },
    },
    "/cms/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" }, description: "User ID" },
        ],
        responses: {
          "200": { description: "User details" },
          "401": { description: "Authentication required" },
          "403": { description: "Access denied" },
          "404": { description: "User not found" },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update user profile",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" }, description: "User ID" },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  email: { type: "string", format: "email" },
                  avatarUrl: { type: "string" },
                  bio: { type: "string" },
                  roleId: { type: "integer", description: "Admin only" },
                  isActive: { type: "boolean", description: "Admin only" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "User updated" },
          "401": { description: "Authentication required" },
          "403": { description: "Access denied" },
          "404": { description: "User not found" },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete a user (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" }, description: "User ID" },
        ],
        responses: {
          "200": { description: "User deleted" },
          "401": { description: "Authentication required" },
          "403": { description: "Cannot delete last admin or insufficient permissions" },
          "404": { description: "User not found" },
          "409": { description: "Cannot delete user with existing articles/comments" },
        },
      },
    },
    "/cms/roles": {
      get: {
        tags: ["Roles"],
        summary: "List all roles",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "List of roles",
            content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { type: "array", items: { $ref: "#/components/schemas/Role" } } } } } },
          },
          "401": { description: "Authentication required" },
        },
      },
    },
    "/public/comments": {
      get: {
        tags: ["Comments"],
        summary: "List all comments (moderation)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "All comments",
            content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { type: "array", items: { $ref: "#/components/schemas/Comment" } } } } } },
          },
          "401": { description: "Authentication required" },
          "403": { description: "Insufficient permissions" },
        },
      },
    },
    "/public/comments/pending": {
      get: {
        tags: ["Comments"],
        summary: "List pending comments (moderation)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Pending comments",
            content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { type: "array", items: { $ref: "#/components/schemas/Comment" } } } } } },
          },
          "401": { description: "Authentication required" },
          "403": { description: "Insufficient permissions" },
        },
      },
    },
    "/public/comments/{id}": {
      patch: {
        tags: ["Comments"],
        summary: "Moderate a comment (approve/reject)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" }, description: "Comment ID" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED"], example: "APPROVED" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Comment status updated" },
          "401": { description: "Authentication required" },
          "403": { description: "Insufficient permissions" },
          "404": { description: "Comment not found" },
        },
      },
      delete: {
        tags: ["Comments"],
        summary: "Delete a comment",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" }, description: "Comment ID" },
        ],
        responses: {
          "200": { description: "Comment deleted" },
          "401": { description: "Authentication required" },
          "403": { description: "Insufficient permissions" },
          "404": { description: "Comment not found" },
        },
      },
    },
    "/public/search": {
      get: {
        tags: ["Search"],
        summary: "Search articles",
        parameters: [
          { in: "query", name: "q", schema: { type: "string" }, description: "Search query (searches title, summary, content, category, tags)" },
          { in: "query", name: "category", schema: { type: "string" }, description: "Filter by category slug" },
          { in: "query", name: "tag", schema: { type: "string" }, description: "Filter by tag slug" },
          { in: "query", name: "page", schema: { type: "integer", default: 1 }, description: "Page number" },
          { in: "query", name: "limit", schema: { type: "integer", default: 10, maximum: 100 }, description: "Items per page" },
          { in: "query", name: "sort", schema: { type: "string", enum: ["latest", "oldest", "relevance"], default: "latest" } },
        ],
        responses: {
          "200": {
            description: "Search results",
            content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { type: "object", properties: { articles: { type: "array", items: { $ref: "#/components/schemas/Article" } }, pagination: { $ref: "#/components/schemas/Pagination" } } } } } } },
          },
          "429": { description: "Too many requests" },
        },
      },
    },
    "/public/contact": {
      post: {
        tags: ["Contact"],
        summary: "Submit a contact message",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "subject", "message"],
                properties: {
                  name: { type: "string", example: "Jane Doe" },
                  email: { type: "string", format: "email", example: "jane@example.com" },
                  subject: { type: "string", example: "Partnership Inquiry" },
                  message: { type: "string", example: "I'd like to discuss a partnership opportunity." },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Message submitted" },
          "400": { description: "Validation error" },
          "429": { description: "Too many requests" },
        },
      },
    },
    "/public/contact/messages": {
      get: {
        tags: ["Contact"],
        summary: "List contact messages (admin/editor)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Contact messages",
            content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { type: "array", items: { $ref: "#/components/schemas/ContactMessage" } } } } } },
          },
          "401": { description: "Authentication required" },
          "403": { description: "Insufficient permissions" },
        },
      },
    },
    "/public/newsletter/subscribe": {
      post: {
        tags: ["Newsletter"],
        summary: "Subscribe to newsletter",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email", example: "jane@example.com" },
                  name: { type: "string", example: "Jane Doe" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Subscribed", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { $ref: "#/components/schemas/NewsletterSubscriber" } } } } } },
          "409": { description: "Already subscribed" },
          "429": { description: "Too many requests" },
        },
      },
    },
    "/public/newsletter/subscribers": {
      get: {
        tags: ["Newsletter"],
        summary: "List subscribers (admin/editor)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "List of subscribers",
            content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { type: "array", items: { $ref: "#/components/schemas/NewsletterSubscriber" } } } } } },
          },
          "401": { description: "Authentication required" },
          "403": { description: "Insufficient permissions" },
        },
      },
    },
    "/public/newsletter/subscribers/{id}": {
      delete: {
        tags: ["Newsletter"],
        summary: "Unsubscribe a subscriber",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" }, description: "Subscriber ID" },
        ],
        responses: {
          "200": { description: "Unsubscribed" },
          "401": { description: "Authentication required" },
          "403": { description: "Insufficient permissions" },
          "404": { description: "Subscriber not found" },
        },
      },
    },
    "/cms/media/upload": {
      post: {
        tags: ["Media"],
        summary: "Upload a media file",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary", description: "Image file (jpg, jpeg, png, webp, max 5MB)" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "File uploaded", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { $ref: "#/components/schemas/Media" } } } } } },
          "400": { description: "Invalid file type or size" },
          "401": { description: "Authentication required" },
          "403": { description: "Insufficient permissions" },
          "429": { description: "Too many requests" },
        },
      },
    },
    "/cms/media": {
      get: {
        tags: ["Media"],
        summary: "List all media files",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "List of media files",
            content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { type: "array", items: { $ref: "#/components/schemas/Media" } } } } } },
          },
          "401": { description: "Authentication required" },
        },
      },
    },
    "/cms/media/{id}": {
      get: {
        tags: ["Media"],
        summary: "Get media file by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" }, description: "Media ID" },
        ],
        responses: {
          "200": { description: "Media details" },
          "401": { description: "Authentication required" },
          "404": { description: "Media not found" },
        },
      },
      delete: {
        tags: ["Media"],
        summary: "Delete a media file",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" }, description: "Media ID" },
        ],
        responses: {
          "200": { description: "Media deleted" },
          "401": { description: "Authentication required" },
          "403": { description: "Insufficient permissions" },
          "404": { description: "Media not found" },
        },
      },
    },
    "/cms/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard analytics (admin/editor)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Dashboard analytics data",
            content: { "application/json": { schema: { $ref: "#/components/schemas/DashboardResponse" } } },
          },
          "401": { description: "Authentication required" },
          "403": { description: "Insufficient permissions" },
        },
      },
    },
  },
};
