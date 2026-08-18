-- Insert the product
WITH new_product AS (
  INSERT INTO public.products (name, category_id, description, price, stock_quantity, status)
  VALUES ('Base fixa Ruby Rose', '9b0890e2-9866-4f6e-acc9-fec1c2fe7c15', 'Base líquida de alta cobertura e longa duração.', 15.00, 25, 'active')
  RETURNING id
)
-- Add a placeholder image
INSERT INTO public.product_images (product_id, url, is_main)
SELECT id, 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=600&auto=format&fit=crop', true
FROM new_product;
