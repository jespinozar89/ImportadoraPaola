export interface Order {
  referenceId: string;
  user: User;
  items: Item[];
  total: number;
}

export interface OrderResponse {
  status: string;
  order_id: string;
  redirect_url: string;
  reference_id: string;
  user: User;
  ship_to: any | null;
  amount: Amount;
  methods: string[];
  items: Item[];
  description: string;
  customs: Custom[];
  urls: Urls;
  webhooks: Webhooks;
  merchant: Merchant;
  payment_details: any[];
  selected_method: SelectedMethod;
  generate_token: string;
}

export interface User {
  email: string;
  rut: string | null;
  first_name: string;
  last_name: string;
  phone: string;
  address_line: string | null;
  address_city: string | null;
  address_state: string | null;
  country: string;
  postal_code: string | null;
}

export interface Item {
  name: string;
  code: string;
  price: number;
  unit_price: number;
  quantity: number;
}

export interface AmountDetails {
  subtotal: number;
  fee: number;
  tax: number;
}

export interface Amount {
  currency: string;
  total: number;
  details: AmountDetails;
}

export interface Custom {
  key: string;
  value: string;
}

export interface Urls {
  return_url: string;
  cancel_url: string;
  logo_url: string | null;
}

export interface Webhooks {
  webhook_validation: string;
  webhook_confirm: string;
  webhook_reject: string;
}

export interface Merchant {
  rut: string;
  business_name: string;
  brand_name: string;
}

export interface SelectedMethod {
  code: string;
  name: string;
}

