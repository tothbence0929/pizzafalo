export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    productType: string;
    vendor: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          availableForSale: boolean;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
        };
      }>;
    };
    options: Array<{
      name: string;
      values: string[];
    }>;
  };
}

const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STORE_PERMANENT_DOMAIN = "szeged-pizza-delivery-dcz9n-1zagy2pw.myshopify.com";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = "4ec5348edbe5427970e2242ab9e645fd";

export const STOREFRONT_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          description
          handle
          productType
          vendor
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      handle
      productType
      vendor
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 5) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 50) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
      options {
        name
        values
      }
    }
  }
`;

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 402) {
    throw new Error("Shopify: Payment required — a paid plan is needed to use the Storefront API.");
  }

  if (!response.ok) {
    throw new Error(`Shopify HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(
      `Error calling Shopify: ${data.errors.map((e: { message: string }) => e.message).join(", ")}`,
    );
  }

  return data;
}

export async function fetchProducts(first = 100, query?: string): Promise<ShopifyProduct[]> {
  const data = await storefrontApiRequest(STOREFRONT_QUERY, { first, query });
  return data?.data?.products?.edges ?? [];
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct["node"] | null> {
  const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
  return data?.data?.product ?? null;
}

export function formatPrice(amount: string, currencyCode: string) {
  const value = parseFloat(amount);
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(value);
}

const CART_QUERY = `
  query cart($id: ID!) {
    cart(id: $id) { id totalQuantity checkoutUrl }
  }
`;

const CART_LINES_QUERY = `
  query cartLines($id: ID!) {
    cart(id: $id) {
      id
      checkoutUrl
      lines(first: 100) {
        edges { node { id quantity merchandise { ... on ProductVariant { id } } } }
      }
    }
  }
`;

const CART_ATTRIBUTES_UPDATE_MUTATION = `
  mutation cartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
    cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

const CART_NOTE_UPDATE_MUTATION = `
  mutation cartNoteUpdate($cartId: ID!, $note: String!) {
    cartNoteUpdate(cartId: $cartId, note: $note) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

const CART_DISCOUNT_CODES_UPDATE_MUTATION = `
  mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart { id checkoutUrl discountCodes { code applicable } }
      userErrors { field message }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id }
      userErrors { field message }
    }
  }
`;

export function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    const hostname = url.hostname.toLowerCase();
    const isMyShopify = hostname.endsWith(".myshopify.com");
    const isOurCustomDomain = hostname === "pizzatnekem.hu" || hostname === "www.pizzatnekem.hu";
    // Keep Shopify's own myshopify.com domain if it is returned (including the
    // pizzatnekem.myshopify.com alias). Only rewrite our custom domain or any
    // other non-Shopify host to the canonical permanent domain.
    if (!isMyShopify || isOurCustomDomain) {
      url.hostname = SHOPIFY_STORE_PERMANENT_DOMAIN;
    }
    url.protocol = "https:";
    url.port = "";
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

function isCartNotFoundError(
  userErrors: Array<{ field: string[] | null; message: string }>,
): boolean {
  return userErrors.some(
    (e) =>
      e.message.toLowerCase().includes("cart not found") ||
      e.message.toLowerCase().includes("does not exist"),
  );
}

export interface CartItemInput {
  variantId: string;
  quantity: number;
}

export async function createShopifyCart(
  item: CartItemInput,
): Promise<{ cartId: string; checkoutUrl: string; lineId: string } | null> {
  const data = await storefrontApiRequest(CART_CREATE_MUTATION, {
    input: { lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] },
  });

  if (data?.data?.cartCreate?.userErrors?.length > 0) {
    console.error("Cart creation failed:", data.data.cartCreate.userErrors);
    return null;
  }

  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;

  const lineId = cart.lines.edges[0]?.node?.id;
  if (!lineId) return null;

  return { cartId: cart.id, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId };
}

export async function addLineToShopifyCart(
  cartId: string,
  item: CartItemInput,
): Promise<{ success: boolean; lineId?: string; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ quantity: item.quantity, merchandiseId: item.variantId }],
  });

  const userErrors = data?.data?.cartLinesAdd?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error("Add line failed:", userErrors);
    return { success: false };
  }

  const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges || [];
  const newLine = lines.find(
    (l: { node: { id: string; merchandise: { id: string } } }) =>
      l.node.merchandise.id === item.variantId,
  );
  return { success: true, lineId: newLine?.node?.id };
}

export async function updateShopifyCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<{ success: boolean; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });

  const userErrors = data?.data?.cartLinesUpdate?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error("Update line failed:", userErrors);
    return { success: false };
  }
  return { success: true };
}

export async function removeLineFromShopifyCart(
  cartId: string,
  lineId: string,
): Promise<{ success: boolean; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds: [lineId],
  });

  const userErrors = data?.data?.cartLinesRemove?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error("Remove line failed:", userErrors);
    return { success: false };
  }
  return { success: true };
}

export async function getCart(
  cartId: string,
): Promise<{ id: string; totalQuantity: number; checkoutUrl?: string } | null> {
  const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
  return data?.data?.cart ?? null;
}

/**
 * Marks the cart with the chosen fulfillment mode so it is visible on the
 * Shopify order (pickup orders are paid at the restaurant).
 */
export async function setCartFulfillmentInfo(
  cartId: string,
  info: {
    mode: "delivery" | "pickup";
    postalCode?: string | undefined;
    scheduledAt?: string | undefined;
    note: string;
  },
): Promise<{ checkoutUrl?: string | undefined }> {
  try {
    const attrData = await storefrontApiRequest(CART_ATTRIBUTES_UPDATE_MUTATION, {
      cartId,
      attributes: [
        {
          key: "Átvétel módja",
          value: info.mode === "pickup" ? "Személyes átvétel" : "Kiszállítás",
        },
        {
          key: "Fizetés",
          value:
            info.mode === "pickup"
              ? "Az étteremben (készpénz, bankkártya vagy OTP SZÉP kártya)"
              : "Online",
        },
        ...(info.postalCode ? [{ key: "Irányítószám", value: info.postalCode }] : []),
        {
          key: "Időzítés",
          value: info.scheduledAt ? `Előrendelés: ${info.scheduledAt}` : "Mielőbb",
        },
      ],
    });

    const noteData = await storefrontApiRequest(CART_NOTE_UPDATE_MUTATION, {
      cartId,
      note: info.note,
    });

    const checkoutUrl =
      noteData?.data?.cartNoteUpdate?.cart?.checkoutUrl ??
      attrData?.data?.cartAttributesUpdate?.cart?.checkoutUrl;

    return { checkoutUrl: checkoutUrl ? formatCheckoutUrl(checkoutUrl) : undefined };
  } catch (error) {
    console.error("Failed to set cart fulfillment info:", error);
    return {};
  }
}

/**
 * Keeps the Shopify cart in sync with the zone-based delivery fee we show in
 * our own cart: removes any previous fee line and adds the correct one.
 * Pass null (pickup or free delivery) to only remove the fee line.
 */
export async function syncDeliveryFeeLine(
  cartId: string,
  feeVariantId: string | null,
  feeVariantIds: string[],
): Promise<{ checkoutUrl?: string | undefined }> {
  try {
    const data = await storefrontApiRequest(CART_LINES_QUERY, { id: cartId });
    const edges: Array<{ node: { id: string; quantity: number; merchandise: { id: string } } }> =
      data?.data?.cart?.lines?.edges ?? [];
    const feeLines = edges.filter((e) => feeVariantIds.includes(e.node.merchandise?.id));

    const keep = feeVariantId ? feeLines.find((e) => e.node.merchandise.id === feeVariantId) : null;
    const staleLineIds = feeLines.filter((e) => e !== keep).map((e) => e.node.id);

    if (staleLineIds.length > 0) {
      await storefrontApiRequest(CART_LINES_REMOVE_MUTATION, { cartId, lineIds: staleLineIds });
    }

    if (feeVariantId && !keep) {
      await storefrontApiRequest(CART_LINES_ADD_MUTATION, {
        cartId,
        lines: [{ quantity: 1, merchandiseId: feeVariantId }],
      });
    } else if (keep && keep.node.quantity !== 1) {
      await storefrontApiRequest(CART_LINES_UPDATE_MUTATION, {
        cartId,
        lines: [{ id: keep.node.id, quantity: 1 }],
      });
    }

    const refreshed = await storefrontApiRequest(CART_LINES_QUERY, { id: cartId });
    const checkoutUrl = refreshed?.data?.cart?.checkoutUrl;
    return { checkoutUrl: checkoutUrl ? formatCheckoutUrl(checkoutUrl) : undefined };
  } catch (error) {
    console.error("Failed to sync delivery fee line:", error);
    return {};
  }
}

/**
 * Applies (or clears) a discount code on the Shopify cart so the checkout
 * total matches the discount shown in our own cart.
 */
export async function setCartDiscountCode(
  cartId: string,
  code: string | null,
): Promise<{ checkoutUrl?: string | undefined; applicable: boolean }> {
  try {
    const data = await storefrontApiRequest(CART_DISCOUNT_CODES_UPDATE_MUTATION, {
      cartId,
      discountCodes: code ? [code] : [],
    });
    const cart = data?.data?.cartDiscountCodesUpdate?.cart;
    const applicable = !code
      ? true
      : Boolean(
          (cart?.discountCodes ?? []).some(
            (d: { code: string; applicable: boolean }) =>
              d.code.toUpperCase() === code.toUpperCase() && d.applicable,
          ),
        );
    return {
      checkoutUrl: cart?.checkoutUrl ? formatCheckoutUrl(cart.checkoutUrl) : undefined,
      applicable,
    };
  } catch (error) {
    console.error("Failed to set cart discount code:", error);
    return { applicable: false };
  }
}
