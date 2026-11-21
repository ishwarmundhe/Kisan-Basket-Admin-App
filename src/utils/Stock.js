// A variant can be ordered only if it has stock and a price in this channel.
// quantityAvailable is 0 when out of stock; if the field is missing we don't
// block (so older cached data never hides everything).
export const isVariantAvailable = (variant) => {
  if (!variant) return false;
  const qty = variant.quantityAvailable;
  const hasStock = qty === undefined || qty === null ? true : qty > 0;
  const hasPrice = variant.pricing?.price?.gross?.amount != null;
  return hasStock && hasPrice;
};

// Keep only products that still have at least one orderable variant,
// and strip the unavailable variants from each product.
export const filterAvailableProducts = (edges = []) =>
  edges
    .map((edge) => {
      const variants = (edge?.node?.variants || []).filter(isVariantAvailable);
      return variants.length ? { ...edge, node: { ...edge.node, variants } } : null;
    })
    .filter(Boolean);
