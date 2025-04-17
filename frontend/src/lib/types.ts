// Model: User
export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: number;
  createdAt: string;
  updatedAt: string;
  address?: string | null;
  phoneNumber?: string | null;
  orders: Order[];
  purchaseOrders: PurchaseOrder[];
  role: Role;
  cart?: Cart | null;
  reviews: ProductReview[];
  warranties: Warranty[];
  returns: ProductReturn[];
}

// Model: Role
export interface Role {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  users: User[];
}

// Model: Supplier
export interface Supplier {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string | null;
  createdAt: string;
  updatedAt: string;
  purchaseOrders: PurchaseOrder[];
}

// Model: PurchaseOrder
export interface PurchaseOrder {
  id: string;
  supplierId: string;
  importDate: string;
  totalCost: number;
  status: string;
  note?: string | null;
  createdById?: number | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: User | null;
  supplier: Supplier;
  purchaseOrderDetails: PurchaseOrderDetail[];
}

// Model: PurchaseOrderDetail
export interface PurchaseOrderDetail {
  id: string;
  importId: string;
  productId: string;
  colorId: string;
  productIdentityId?: string | null;
  importPrice: number;
  createdAt: string;
  updatedAt: string;
  imei?: string | null;
  color: Color;
  import: PurchaseOrder;
  product: Product;
  productIdentity?: ProductIdentity | null;
}

// Model: ProductIdentity
export interface ProductIdentity {
  id: string;
  imei: string;
  colorId: string;
  productId: string;
  isSold: boolean;
  createdAt: string;
  updatedAt: string;
  orderDetail?: OrderDetail | null;
  color: Color;
  product: Product;
  purchaseOrderDetail?: PurchaseOrderDetail | null;
  warranties: Warranty[];
  returns: ProductReturn[];
}

// Model: Product
export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  storage: number;
  ram: number;
  screenSize: number;
  battery: number;
  chip: string;
  operatingSystem: string;
  discountedPrice?: number;
  modelId: string;
  createdAt: string;
  updatedAt: string;
  orderDetails: OrderDetail[];
  model: Model;
  productFiles: ProductFiles[];
  productIdentities: ProductIdentity[];
  purchaseOrderDetails: PurchaseOrderDetail[];
  reviews: ProductReview[];
  promotions: ProductPromotion[];
  cartItems: CartItem[];
  rating?: number;
}

// Model: Model
export interface Model {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  createdAt: string;
  updatedAt: string;
  brand: Brand;
  products: Product[];
}

// Model: Brand
export interface Brand {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  models: Model[];
}

// Model: Color
export interface Color {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  orderDetails: OrderDetail[];
  productIdentities: ProductIdentity[];
  purchaseOrderDetails: PurchaseOrderDetail[];
  cartItems: CartItem[];
}

// Model: File
export interface File {
  id: string;
  url: string;
  public_id: string;
  file_type: string;
  size?: number | null;
  uploaded_at: string;
  createdAt: string;
  updatedAt: string;
  productFiles: ProductFiles[];
  slides: Slide[];
}

// Model: ProductFiles
export interface ProductFiles {
  productId: string;
  fileId: string;
  isMain: boolean;
  createdAt: string;
  updatedAt: string;
  file: File;
  product: Product;
}

// Model: Order
export interface Order {
  id: string;
  userId: number;
  address: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
  orderDetails: OrderDetail[];
  payment?: Payment | null;
}

// Model: OrderDetail
export interface OrderDetail {
  id: string;
  orderId: string;
  productId: string;
  colorId: string;
  productIdentityId: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  color: Color;
  order: Order;
  product: Product;
  productIdentity: ProductIdentity;
}

// Model: Slide
export interface Slide {
  id: string;
  title?: string | null;
  imageId: string;
  link?: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  image: File;
}

// Model: BlacklistToken
export interface BlacklistToken {
  id: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

// Model: Cart
export interface Cart {
  id: string;
  userId: number;
  user: User;
  cartItems: CartItem[];
  createdAt: string;
  updatedAt: string;
}

// Model: CartItem
export interface CartItem {
  id: string;
  cartId: string;
  cart: Cart;
  productId: string;
  colorId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
  color: Color;
}

// Model: ProductReview
export interface ProductReview {
  id: string;
  userId: number;
  productId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
  product: Product;
}

// Model: Promotion
export interface Promotion {
  id: string;
  code: string;
  description?: string | null;
  discount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  products: ProductPromotion[];
}

// Model: ProductPromotion
export interface ProductPromotion {
  productId: string;
  promotionId: string;
  createdAt: string;
  updatedAt: string;
  product: Product;
  promotion: Promotion;
}

// Model: Warranty
export interface Warranty {
  id: string;
  userId: number;
  productIdentityId: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  productIdentity: ProductIdentity;
}

// Model: ProductReturn
export interface ProductReturn {
  id: string;
  userId: number;
  productIdentityId: string;
  reason: string;
  status: string;
  returnDate: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  productIdentity: ProductIdentity;
}

// Model: Payment
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId?: string | null;
  transactionDate?: string | null;
  createdAt: string;
  updatedAt: string;
  order: Order;
}
