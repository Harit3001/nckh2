export const openAPISpec = {
  openapi: "3.0.0",
  info: {
    title: "Benh-An-Blockchain API",
    description: "API documentation for Benh-An-Blockchain platform",
    version: "1.0.0",
  },
  servers: [
    {
      url: "https://work-flow-production-a826.up.railway.app",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login với email và password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                  },
                  password: {
                    type: "string",
                    minLength: 6,
                    example: "password123",
                  },
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
                    success: { type: "boolean", example: true },
                    status: { type: "number", example: 200 },
                    message: { type: "string", example: "login thành công" },
                    data: {
                      type: "object",
                      properties: {
                        accessToken: {
                          type: "string",
                          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        },
                        refreshToken: {
                          type: "string",
                          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid credentials or validation error",
          },
          "401": {
            description: "Email or password is incorrect",
          },
        },
      },
    },
    "/auth/register-patient": {
      post: {
        tags: ["Authentication"],
        summary: "Đăng kí tài khoản bệnh nhân",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "email",
                  "password",
                  "fullName",
                  "dob",
                  "bloodType",
                  "allergyInfo",
                  "nationalId",
                ],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "patient@example.com",
                  },
                  password: {
                    type: "string",
                    minLength: 6,
                    example: "password123",
                  },
                  fullName: { type: "string", example: "Nguyễn Văn A" },
                  dob: {
                    type: "string",
                    format: "date",
                    example: "1990-01-15",
                  },
                  bloodType: {
                    type: "string",
                    enum: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
                    example: "O+",
                  },
                  allergyInfo: {
                    type: "string",
                    example: "Không có dị ứng",
                  },
                  nationalId: {
                    type: "string",
                    example: "123456789",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Patient registration successful",
          },
          "400": {
            description: "Invalid data or validation error",
          },
          "409": {
            description: "Email or nationalId already exists",
          },
        },
      },
    },
    "/auth/register-doctor": {
      post: {
        tags: ["Authentication"],
        summary: "Đăng kí tài khoản bác sĩ",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "email",
                  "fullName",
                  "password",
                  "doctorCode",
                  "speciality",
                  "hospitalId",
                ],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "doctor@example.com",
                  },
                  fullName: { type: "string", example: "Dr. Nguyễn Văn B" },
                  password: {
                    type: "string",
                    minLength: 6,
                    example: "password123",
                  },
                  doctorCode: {
                    type: "string",
                    pattern: "^BS\\d{6,}$",
                    example: "BS000001",
                  },
                  speciality: { type: "string", example: "Tim mạch" },
                  hospitalId: { type: "number", example: 1 },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Doctor registration successful",
          },
          "400": {
            description: "Invalid data or validation error",
          },
          "409": {
            description: "Email or doctorCode already exists",
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Đăng xuất",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Logout successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    status: { type: "number", example: 200 },
                    message: { type: "string", example: "Logout thành công" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized - Invalid or missing token",
          },
        },
      },
    },
    "/auth/refresh-token": {
      post: {
        tags: ["Authentication"],
        summary: "Làm mới access token",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Token refreshed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    status: { type: "number", example: 200 },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        accessToken: { type: "string" },
                        refreshToken: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized - Invalid or missing token",
          },
        },
      },
    },
    "/auth/profile": {
      get: {
        tags: ["Authentication"],
        summary: "Lấy thông tin profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Get profile successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    status: { type: "number", example: 200 },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        email: { type: "string" },
                        role: {
                          type: "string",
                          enum: ["PATIENT", "DOCTOR", "ADMIN"],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized - Invalid or missing token",
          },
        },
      },
    },
    "/admin/doctors": {
      get: {
        tags: ["Admin"],
        summary: "Lấy danh sách bác sĩ chờ phê duyệt",
        security: [{ bearerAuth: [] }],

        responses: {
          "200": {
            description: "Lấy danh sách thành công",
          },
          "401": {
            description: "Unauthorized - Invalid or missing token",
          },
          "403": {
            description: "Forbidden - User is not an admin",
          },
        },
      },
    },

    "/admin/doctors/{doctorId}/approve": {
      patch: {
        tags: ["Admin"],
        summary: "Phê duyệt bác sĩ",
        security: [{ bearerAuth: [] }],

        parameters: [
          {
            name: "doctorId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],

        responses: {
          "200": {
            description: "Phê duyệt bác sĩ thành công",
          },
          "400": {
            description: "Bác sĩ này đã được xử lý",
          },
          "401": {
            description: "Unauthorized - Invalid or missing token",
          },
          "403": {
            description: "Forbidden - User is not an admin",
          },
          "404": {
            description: "Bác sĩ không tồn tại",
          },
        },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Authentication"],
        summary: "Yêu cầu đặt lại mật khẩu",
        description:
          "Kiểm tra email, tạo mã OTP 6 số có hiệu lực trong 5 phút và gửi OTP đến email của người dùng.",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                    description: "Email của tài khoản cần đặt lại mật khẩu",
                  },
                },
              },
            },
          },
        },

        responses: {
          "200": {
            description: "Đã gửi mã OTP thành công",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    status: {
                      type: "number",
                      example: 200,
                    },
                    message: {
                      type: "string",
                      example: "Đã gửi mã OTP đến bạn",
                    },
                  },
                },
              },
            },
          },

          "400": {
            description: "Email không hợp lệ",
          },

          "404": {
            description: "Email không tồn tại",
            content: {
              "application/json": {
                example: {
                  success: false,
                  status: 404,
                  message: "email này không tồn tại",
                },
              },
            },
          },
        },
      },
    },

    "/auth/verify-reset-password": {
      post: {
        tags: ["Authentication"],
        summary: "Xác thực OTP đặt lại mật khẩu",
        description:
          "Kiểm tra mã OTP được gửi đến email. OTP có hiệu lực trong 5 phút và chỉ được xác thực một lần.",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "otp"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                    description: "Email đã yêu cầu đặt lại mật khẩu",
                  },

                  otp: {
                    type: "string",
                    minLength: 6,
                    maxLength: 6,
                    pattern: "^[0-9]{6}$",
                    example: "123456",
                    description: "Mã OTP gồm 6 chữ số",
                  },
                },
              },
            },
          },
        },

        responses: {
          "200": {
            description: "Xác thực OTP thành công",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    status: {
                      type: "number",
                      example: 200,
                    },
                    message: {
                      type: "string",
                      example: "verify otp thành công",
                    },
                  },
                },
              },
            },
          },

          "400": {
            description:
              "OTP không chính xác, OTP đã được xác thực, OTP đã được sử dụng hoặc OTP đã hết hạn",
            content: {
              "application/json": {
                examples: {
                  invalidOtp: {
                    summary: "OTP không chính xác",
                    value: {
                      success: false,
                      status: 400,
                      message: "Mã OTP không chính xác",
                    },
                  },

                  expiredOtp: {
                    summary: "OTP hết hạn",
                    value: {
                      success: false,
                      status: 400,
                      message: "Mã OTP này đã hết hạn",
                    },
                  },

                  usedOtp: {
                    summary: "OTP đã được sử dụng",
                    value: {
                      success: false,
                      status: 400,
                      message: "Mã OTP này đã được sử dụng",
                    },
                  },

                  alreadyVerified: {
                    summary: "OTP đã được xác thực",
                    value: {
                      success: false,
                      status: 400,
                      message: "OTP đã được xác thực",
                    },
                  },
                },
              },
            },
          },

          "404": {
            description: "Người dùng không tồn tại hoặc chưa yêu cầu OTP",
            content: {
              "application/json": {
                examples: {
                  userNotFound: {
                    summary: "Người dùng không tồn tại",
                    value: {
                      success: false,
                      status: 404,
                      message: "Người dùng này không tồn tại",
                    },
                  },

                  otpNotFound: {
                    summary: "Chưa yêu cầu OTP",
                    value: {
                      success: false,
                      status: 404,
                      message: "Vui lòng gửi yêu cầu để nhận OTP",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/auth/update-password": {
      post: {
        tags: ["Authentication"],
        summary: "Thay đổi mật khẩu",
        description:
          "Thay đổi mật khẩu sau khi email đã được xác thực OTP. Mật khẩu mới và mật khẩu xác nhận phải giống nhau.",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "confirmPassword"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                    description: "Email của tài khoản cần đổi mật khẩu",
                  },

                  password: {
                    type: "string",
                    minLength: 6,
                    maxLength: 50,
                    example: "newPassword123",
                    description: "Mật khẩu mới",
                  },

                  confirmPassword: {
                    type: "string",
                    minLength: 6,
                    maxLength: 50,
                    example: "newPassword123",
                    description: "Nhập lại mật khẩu mới",
                  },
                },
              },
            },
          },
        },

        responses: {
          "200": {
            description: "Thay đổi mật khẩu thành công",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    status: {
                      type: "number",
                      example: 200,
                    },
                    message: {
                      type: "string",
                      example: "thay đổi password thành công",
                    },
                  },
                },
              },
            },
          },

          "400": {
            description:
              "Mật khẩu không khớp, chưa verify OTP, OTP đã hết hạn hoặc OTP đã được sử dụng",
            content: {
              "application/json": {
                examples: {
                  passwordNotMatch: {
                    summary: "Mật khẩu không khớp",
                    value: {
                      success: false,
                      status: 400,
                      message: "Mật khẩu không khớp",
                    },
                  },

                  otpNotVerified: {
                    summary: "Chưa verify OTP",
                    value: {
                      success: false,
                      status: 400,
                      message: "vui lòng verify OTP",
                    },
                  },

                  otpExpired: {
                    summary: "Đã hết thời gian đổi mật khẩu",
                    value: {
                      success: false,
                      status: 400,
                      message: "đã hết thời gian đổi mật khẩu",
                    },
                  },

                  otpUsed: {
                    summary: "OTP đã được sử dụng",
                    value: {
                      success: false,
                      status: 400,
                      message: "Mã OTP đã được sử dụng",
                    },
                  },
                },
              },
            },
          },

          "404": {
            description: "Người dùng không tồn tại",
            content: {
              "application/json": {
                example: {
                  success: false,
                  status: 404,
                  message: "Người dùng này không tồn tại",
                },
              },
            },
          },
        },
      },
    },
    "/auth/generate-nonce": {
      post: {
        tags: ["Authentication"],
        summary: "Sinh nonce cho ví",
        description:
          "Tạo nonce ngẫu nhiên có hiệu lực trong 5 phút để người dùng ký bằng ví Ethereum.",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["addressWallet"],
                properties: {
                  addressWallet: {
                    type: "string",
                    example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                    description: "Địa chỉ ví Ethereum",
                  },
                },
              },
            },
          },
        },

        responses: {
          "200": {
            description: "Sinh nonce thành công",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    status: {
                      type: "number",
                      example: 200,
                    },
                    message: {
                      type: "string",
                      example: "Đã sinh nonce thành công",
                    },
                    data: {
                      type: "object",
                      properties: {
                        nonce: {
                          type: "string",
                          example: "a8f3c91d5e7b2a4f8c6d1e9b3a7f5c2d",
                        },
                      },
                    },
                  },
                },
              },
            },
          },

          "400": {
            description: "Địa chỉ ví không hợp lệ",
            content: {
              "application/json": {
                example: {
                  success: false,
                  status: 400,
                  message: "Địa chỉ ví không hợp lệ",
                },
              },
            },
          },
        },
      },
    },

    "/auth/link-wallet": {
      post: {
        tags: ["Authentication"],
        summary: "Liên kết ví với tài khoản",
        description:
          "Liên kết địa chỉ ví Ethereum với tài khoản hiện tại. Người dùng phải đăng nhập và ký EIP-712 để xác thực quyền sở hữu ví.",

        security: [{ bearerAuth: [] }],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["addressWallet", "signature"],
                properties: {
                  addressWallet: {
                    type: "string",
                    example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                    description: "Địa chỉ ví Ethereum cần liên kết",
                  },

                  signature: {
                    type: "string",
                    example:
                      "0x8f2a559490d5f6a7c8b9e1d3f4a5b6c7d8e9f00112233445566778899aabbcc",
                    description: "Chữ ký EIP-712 được tạo từ nonce",
                  },
                },
              },
            },
          },
        },

        responses: {
          "200": {
            description: "Liên kết ví thành công",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    status: {
                      type: "number",
                      example: 200,
                    },
                    message: {
                      type: "string",
                      example: "Liên kết ví thành công",
                    },
                    data: {
                      type: "object",
                      properties: {
                        walletAddress: {
                          type: "string",
                          example: "0x742d35cc6634c0532925a3b844bc454e4438f44e",
                        },
                      },
                    },
                  },
                },
              },
            },
          },

          "400": {
            description:
              "Địa chỉ ví không hợp lệ, nonce không hợp lệ, nonce hết hạn hoặc chữ ký không hợp lệ",
            content: {
              "application/json": {
                examples: {
                  invalidWallet: {
                    summary: "Địa chỉ ví không hợp lệ",
                    value: {
                      success: false,
                      status: 400,
                      message: "Địa chỉ ví không hợp lệ",
                    },
                  },

                  walletAlreadyLinked: {
                    summary: "Tài khoản đã có ví",
                    value: {
                      success: false,
                      status: 400,
                      message: "Tài khoản của bạn đã liên kết với ví rồi",
                    },
                  },

                  walletAlreadyUsed: {
                    summary: "Ví đã được liên kết",
                    value: {
                      success: false,
                      status: 400,
                      message: "Ví này đã được liên kết với tài khoản khác",
                    },
                  },

                  nonceExpired: {
                    summary: "Nonce hết hạn",
                    value: {
                      success: false,
                      status: 400,
                      message: "Nonce đã hết hạn, vui lòng thử lại",
                    },
                  },

                  invalidSignature: {
                    summary: "Chữ ký không hợp lệ",
                    value: {
                      success: false,
                      status: 400,
                      message: "Chữ ký không hợp lệ",
                    },
                  },
                },
              },
            },
          },

          "401": {
            description: "Unauthorized - Token không tồn tại hoặc không hợp lệ",
          },
        },
      },
    },

    "/auth/verify-and-login": {
      post: {
        tags: ["Authentication"],
        summary: "Đăng nhập bằng ví",
        description:
          "Đăng nhập bằng ví Ethereum. Người dùng ký EIP-712 với nonce đã được sinh trước đó. Nếu ví đã được liên kết với tài khoản, hệ thống sẽ trả về access token và refresh token.",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["addressWallet", "signature"],
                properties: {
                  addressWallet: {
                    type: "string",
                    example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                    description: "Địa chỉ ví Ethereum",
                  },

                  signature: {
                    type: "string",
                    example:
                      "0x8f2a559490d5f6a7c8b9e1d3f4a5b6c7d8e9f00112233445566778899aabbcc",
                    description: "Chữ ký EIP-712 được tạo từ nonce",
                  },
                },
              },
            },
          },
        },

        responses: {
          "200": {
            description: "Đăng nhập bằng ví thành công",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },

                    status: {
                      type: "number",
                      example: 200,
                    },

                    message: {
                      type: "string",
                      example: "Login thành công",
                    },

                    data: {
                      type: "object",
                      properties: {
                        accessToken: {
                          type: "string",
                          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        },

                        refreshToken: {
                          type: "string",
                          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        },
                      },
                    },
                  },
                },
              },
            },
          },

          "400": {
            description:
              "Địa chỉ ví không hợp lệ, nonce không tồn tại, nonce hết hạn, chữ ký không hợp lệ hoặc ví chưa được liên kết",
            content: {
              "application/json": {
                examples: {
                  invalidWallet: {
                    summary: "Địa chỉ ví không hợp lệ",
                    value: {
                      success: false,
                      status: 400,
                      message: "Địa chỉ ví không hợp lệ",
                    },
                  },

                  nonceNotFound: {
                    summary: "Nonce không tồn tại",
                    value: {
                      success: false,
                      status: 400,
                      message: "Đăng nhập không hợp lệ hoặc đã hết hạn",
                    },
                  },

                  nonceExpired: {
                    summary: "Nonce hết hạn",
                    value: {
                      success: false,
                      status: 400,
                      message: "nonce đã hết hạn vui lòng thử lại",
                    },
                  },

                  invalidSignature: {
                    summary: "Chữ ký không hợp lệ",
                    value: {
                      success: false,
                      status: 400,
                      message: "Chữ kí không hợp lệ",
                    },
                  },

                  walletNotLinked: {
                    summary: "Ví chưa được liên kết",
                    value: {
                      success: false,
                      status: 400,
                      message: "Ví hiện tại chưa được liên kết",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
