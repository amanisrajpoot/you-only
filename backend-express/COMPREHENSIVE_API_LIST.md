# Comprehensive API Endpoints from Laravel Backend

## PUBLIC ENDPOINTS (No Authentication Required)

### Authentication & User Management
- `POST /register` - User registration
- `POST /token` - User login
- `POST /logout` - User logout
- `POST /forget-password` - Request password reset
- `POST /verify-forget-password-token` - Verify password reset token
- `POST /reset-password` - Reset password
- `POST /contact-us` - Contact admin
- `POST /social-login-token` - Social media login
- `POST /send-otp-code` - Send OTP code
- `POST /verify-otp-code` - Verify OTP code
- `POST /otp-login` - OTP login
- `POST /subscribe-to-newsletter` - Newsletter subscription
- `POST /license-key/verify` - Verify license key

### Products
- `GET /products` - List products (index, show)
- `GET /popular-products` - Popular products
- `GET /best-selling-products` - Best selling products
- `GET /check-availability` - Check product availability
- `GET /products/calculate-rental-price` - Calculate rental price
- `POST /import-products` - Import products
- `POST /import-variation-options` - Import variation options
- `GET /export-products/{shop_id}` - Export products
- `GET /export-variation-options/{shop_id}` - Export variation options
- `POST /generate-description` - Generate product description

### Categories
- `GET /categories` - List categories (index, show)
- `GET /featured-categories` - Featured categories

### Types
- `GET /types` - List types (index, show)

### Tags
- `GET /tags` - List tags (index, show)

### Attributes
- `GET /attributes` - List attributes (index, show)
- `POST /import-attributes` - Import attributes
- `GET /export-attributes/{shop_id}` - Export attributes

### Coupons
- `GET /coupons` - List coupons (index, show)
- `POST /coupons/verify` - Verify coupon

### Shops
- `GET /shops` - List shops (index, show)
- `GET /near-by-shop/{lat}/{lng}` - Nearby shops

### Authors & Manufacturers
- `GET /top-authors` - Top authors
- `GET /top-manufacturers` - Top manufacturers
- `GET /authors` - List authors (index, show)
- `GET /manufacturers` - List manufacturers (index, show)

### Reviews & Questions
- `GET /reviews` - List reviews (index, show)
- `GET /questions` - List questions (index, show)

### Orders & Checkout
- `POST /orders/checkout/verify` - Verify checkout
- `GET /orders` - Show order (show, store)
- `POST /orders/payment` - Submit payment

### Downloads & Files
- `GET /download_url/token/{token}` - Download file
- `GET /export-order/token/{token}` - Export order
- `GET /download-invoice/token/{token}` - Download invoice

### Settings & Resources
- `GET /settings` - Get settings
- `GET /resources` - List resources (index, show)
- `GET /store-notices` - List store notices

### Attachments
- `GET /attachments` - List attachments (index, show)

### Other Public Endpoints
- `GET /faqs` - List FAQs (index, show)
- `GET /terms-and-conditions` - Terms and conditions (index, show)
- `GET /flash-sale` - Flash sales (index, show)
- `GET /refund-reasons` - Refund reasons (index, show)
- `GET /refund-policies` - Refund policies (index, show)
- `POST /shop-maintenance-event` - Shop maintenance event

### Webhooks
- `POST /webhooks/razorpay` - Razorpay webhook
- `POST /webhooks/stripe` - Stripe webhook
- `POST /webhooks/paypal` - PayPal webhook
- `POST /webhooks/mollie` - Mollie webhook
- `POST /webhooks/paystack` - Paystack webhook
- `POST /webhooks/paymongo` - Paymongo webhook
- `POST /webhooks/xendit` - Xendit webhook
- `POST /webhooks/iyzico` - Iyzico webhook
- `POST /webhooks/bkash` - Bkash webhook
- `POST /webhooks/flutterwave` - Flutterwave webhook
- `GET /callback/flutterwave` - Flutterwave callback

### Payment
- `GET /payment-intent` - Get payment intent

### AI
- `POST /generate-descriptions` - Generate descriptions

## CUSTOMER ENDPOINTS (Customer Permission Required)

### User Management
- `GET /me` - Get current user
- `POST /update-email` - Update email
- `PUT /users/{id}` - Update user
- `POST /change-password` - Change password
- `POST /update-contact` - Update contact

### Orders
- `GET /orders` - List user orders (index)
- `GET /orders/tracking-number/{tracking_number}` - Find order by tracking number

### Reviews & Questions
- `POST /reviews` - Create review
- `PUT /reviews/{id}` - Update review
- `POST /questions` - Create question
- `GET /my-questions` - My questions

### Feedback & Reports
- `POST /feedbacks` - Create feedback
- `POST /abusive_reports` - Create abusive report
- `GET /my-reports` - My reports

### Conversations & Messages
- `GET /conversations` - List conversations
- `POST /conversations` - Create conversation
- `GET /conversations/{conversation_id}` - Show conversation
- `GET /messages/conversations/{conversation_id}` - List messages
- `POST /messages/conversations/{conversation_id}` - Send message
- `POST /messages/seen/{conversation_id}` - Mark messages as seen

### Wishlist
- `POST /wishlists/toggle` - Toggle wishlist
- `GET /wishlists` - List wishlists
- `POST /wishlists` - Add to wishlist
- `DELETE /wishlists/{id}` - Remove from wishlist
- `GET /wishlists/in_wishlist/{product_id}` - Check if in wishlist
- `GET /my-wishlists` - My wishlists

### Attachments
- `POST /attachments` - Upload attachment
- `PUT /attachments/{id}` - Update attachment
- `DELETE /attachments/{id}` - Delete attachment

### Address
- `DELETE /address/{id}` - Delete address

### Refunds
- `GET /refunds` - List refunds
- `POST /refunds` - Request refund
- `GET /refunds/{id}` - Show refund

### Downloads
- `GET /downloads` - Fetch downloadable files
- `POST /downloads/digital_file` - Generate downloadable URL

### Shop Following
- `GET /followed-shops-popular-products` - Followed shops popular products
- `GET /followed-shops` - User followed shops
- `GET /follow-shop` - Check if following shop
- `POST /follow-shop` - Follow/unfollow shop

### Payment Methods
- `GET /cards` - List payment methods
- `POST /cards` - Add payment method
- `PUT /cards/{id}` - Update payment method
- `DELETE /cards/{id}` - Delete payment method
- `POST /set-default-card` - Set default card
- `POST /save-payment-method` - Save payment method

### Notifications
- `GET /notify-logs` - List notifications
- `GET /notify-logs/{id}` - Show notification
- `POST /notify-log-seen` - Mark notification as seen
- `POST /notify-log-read-all` - Mark all notifications as read

## STAFF & STORE OWNER ENDPOINTS (Staff/Store Owner Permission Required)

### Products
- `POST /products` - Create product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

### Attributes
- `POST /attributes` - Create attribute
- `PUT /attributes/{id}` - Update attribute
- `DELETE /attributes/{id}` - Delete attribute
- `POST /attribute-values` - Create attribute value
- `PUT /attribute-values/{id}` - Update attribute value
- `DELETE /attribute-values/{id}` - Delete attribute value

### Orders
- `PUT /orders/{id}` - Update order
- `DELETE /orders/{id}` - Delete order
- `GET /export-order-url/{shop_id?}` - Export order URL
- `POST /download-invoice-url` - Download invoice URL

### Questions
- `PUT /questions/{id}` - Update question

### Authors & Manufacturers
- `POST /authors` - Create author
- `POST /manufacturers` - Create manufacturer

### Store Notices
- `GET /store-notices/getStoreNoticeType` - Get store notice types
- `GET /store-notices/getUsersToNotify` - Get users to notify
- `POST /store-notices/read/` - Read notice
- `POST /store-notices/read-all` - Read all notices
- `GET /store-notices/{id}` - Show store notice
- `POST /store-notices` - Create store notice
- `PUT /store-notices/{id}` - Update store notice
- `DELETE /store-notices/{id}` - Delete store notice

### FAQs
- `POST /faqs` - Create FAQ
- `PUT /faqs/{id}` - Update FAQ
- `DELETE /faqs/{id}` - Delete FAQ

### Analytics
- `GET /analytics` - Get analytics
- `GET /low-stock-products` - Low stock products
- `GET /category-wise-product` - Category wise products
- `GET /category-wise-product-sale` - Category wise product sales
- `GET /draft-products` - Draft products
- `GET /products-stock` - Product stock
- `GET /products-by-flash-sale` - Products by flash sale
- `GET /top-rate-product` - Top rated products

### Coupons
- `PUT /coupons/{id}` - Update coupon

### Flash Sale
- `GET /requested-products-for-flash-sale` - Requested products for flash sale
- `GET /vendor-requests-for-flash-sale` - Vendor requests for flash sale
- `POST /vendor-requests-for-flash-sale` - Create vendor request
- `GET /vendor-requests-for-flash-sale/{id}` - Show vendor request
- `DELETE /vendor-requests-for-flash-sale/{id}` - Delete vendor request

### Resources
- `POST /resources` - Create resource

## STORE OWNER ENDPOINTS (Store Owner Permission Required)

### Shops
- `POST /shops` - Create shop
- `PUT /shops/{id}` - Update shop
- `DELETE /shops/{id}` - Delete shop
- `GET /my-shops` - My shops
- `POST /transfer-shop-ownership` - Transfer shop ownership

### Withdraws
- `GET /withdraws` - List withdraws
- `POST /withdraws` - Create withdraw
- `GET /withdraws/{id}` - Show withdraw

### Staff Management
- `POST /staffs` - Add staff
- `DELETE /staffs/{id}` - Delete staff
- `GET /staffs` - List staff

### Flash Sale
- `POST /flash-sale` - Create flash sale
- `PUT /flash-sale/{id}` - Update flash sale
- `DELETE /flash-sale/{id}` - Delete flash sale
- `GET /product-flash-sale-info` - Flash sale info by product

### Terms & Conditions
- `POST /terms-and-conditions` - Create terms
- `PUT /terms-and-conditions/{id}` - Update terms
- `DELETE /terms-and-conditions/{id}` - Delete terms

### Coupons
- `POST /coupons` - Create coupon
- `DELETE /coupons/{id}` - Delete coupon

### Vendors
- `GET /vendors/list` - List vendors

### Ownership Transfer
- `GET /ownership-transfer` - List ownership transfers
- `GET /ownership-transfer/{id}` - Show ownership transfer

## SUPER ADMIN ENDPOINTS (Super Admin Permission Required)

### Types
- `POST /types` - Create type
- `PUT /types/{id}` - Update type
- `DELETE /types/{id}` - Delete type

### Withdraws
- `PUT /withdraws/{id}` - Update withdraw
- `DELETE /withdraws/{id}` - Delete withdraw
- `POST /approve-withdraw` - Approve withdraw

### Categories
- `POST /categories` - Create category
- `PUT /categories/{id}` - Update category
- `DELETE /categories/{id}` - Delete category

### Delivery Times
- `POST /delivery-times` - Create delivery time
- `PUT /delivery-times/{id}` - Update delivery time
- `DELETE /delivery-times/{id}` - Delete delivery time

### Languages
- `POST /languages` - Create language
- `PUT /languages/{id}` - Update language
- `DELETE /languages/{id}` - Delete language

### Tags
- `POST /tags` - Create tag
- `PUT /tags/{id}` - Update tag
- `DELETE /tags/{id}` - Delete tag

### Refund Reasons
- `POST /refund-reasons` - Create refund reason
- `PUT /refund-reasons/{id}` - Update refund reason
- `DELETE /refund-reasons/{id}` - Delete refund reason

### Resources
- `PUT /resources/{id}` - Update resource
- `DELETE /resources/{id}` - Delete resource

### Reviews
- `DELETE /reviews/{id}` - Delete review

### Questions
- `DELETE /questions/{id}` - Delete question

### Feedbacks
- `PUT /feedbacks/{id}` - Update feedback
- `DELETE /feedbacks/{id}` - Delete feedback

### Abusive Reports
- `GET /abusive_reports` - List abusive reports
- `GET /abusive_reports/{id}` - Show abusive report
- `PUT /abusive_reports/{id}` - Update abusive report
- `DELETE /abusive_reports/{id}` - Delete abusive report
- `POST /abusive_reports/accept` - Accept abusive report
- `POST /abusive_reports/reject` - Reject abusive report

### Settings
- `POST /settings` - Create setting

### Users
- `GET /users` - List users
- `POST /users` - Create user
- `GET /users/{id}` - Show user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user
- `POST /users/block-user` - Block user
- `POST /users/unblock-user` - Unblock user
- `POST /users/make-admin` - Make user admin
- `POST /add-points` - Add points to user

### Authors & Manufacturers
- `PUT /authors/{id}` - Update author
- `DELETE /authors/{id}` - Delete author
- `PUT /manufacturers/{id}` - Update manufacturer
- `DELETE /manufacturers/{id}` - Delete manufacturer

### Taxes
- `GET /taxes` - List taxes
- `POST /taxes` - Create tax
- `GET /taxes/{id}` - Show tax
- `PUT /taxes/{id}` - Update tax
- `DELETE /taxes/{id}` - Delete tax

### Shipping
- `GET /shippings` - List shipping
- `POST /shippings` - Create shipping
- `GET /shippings/{id}` - Show shipping
- `PUT /shippings/{id}` - Update shipping
- `DELETE /shippings/{id}` - Delete shipping

### Shop Management
- `POST /approve-shop` - Approve shop
- `POST /disapprove-shop` - Disapprove shop

### Refunds
- `DELETE /refunds/{id}` - Delete refund
- `PUT /refunds/{id}` - Update refund

### Notifications
- `DELETE /notify-logs/{id}` - Delete notification

### Shop Analytics
- `GET /new-shops` - New or inactive shops

### Terms & Conditions
- `POST /approve-terms-and-conditions` - Approve terms
- `POST /disapprove-terms-and-conditions` - Disapprove terms

### Admin Management
- `GET /admin/list` - List admins
- `GET /customers/list` - List customers
- `GET /my-staffs` - My staffs
- `GET /all-staffs` - All staffs

### Refund Policies
- `POST /refund-policies` - Create refund policy
- `PUT /refund-policies/{id}` - Update refund policy
- `DELETE /refund-policies/{id}` - Delete refund policy

### Coupons
- `POST /approve-coupon` - Approve coupon
- `POST /disapprove-coupon` - Disapprove coupon

### Flash Sale Management
- `POST /approve-flash-sale-requested-products` - Approve flash sale products
- `POST /disapprove-flash-sale-requested-products` - Disapprove flash sale products
- `PUT /vendor-requests-for-flash-sale/{id}` - Update vendor request

### Ownership Transfer
- `PUT /ownership-transfer/{id}` - Update ownership transfer
- `DELETE /ownership-transfer/{id}` - Delete ownership transfer

## BECAME SELLER ENDPOINTS (No specific permission)

### Became Seller
- `GET /became-seller` - List became seller requests
- `POST /became-seller` - Create became seller request
- `GET /became-seller/{id}` - Show became seller request
- `PUT /became-seller/{id}` - Update became seller request
- `DELETE /became-seller/{id}` - Delete became seller request
