import { supabase } from "../src/integrations/supabase/client.server";

async function updateCategories() {
  const categories = [
    { name: 'Maquiagem', image_url: '/src/assets/cat-maquiagem.png', tone: '#F06292' },
    { name: 'Skincare', image_url: '/src/assets/cat-skincare.png', tone: '#F06292' },
    { name: 'Cabelos', image_url: '/src/assets/cat-cabelos.png', tone: '#F06292' },
    { name: 'Corpo', image_url: '/src/assets/cat-corpo.png', tone: '#F06292' },
    { name: 'Kits', image_url: '/src/assets/cat-kits.png', tone: '#F06292' },
  ];

  for (const cat of categories) {
    console.log(`Updating category: ${cat.name}`);
    const { error } = await supabase
      .from('categories')
      .update({ 
        image_url: cat.image_url,
        tone: cat.tone
      })
      .ilike('name', cat.name);
    
    if (error) {
      console.error(`Error updating ${cat.name}:`, error.message);
    } else {
      console.log(`Successfully updated ${cat.name}`);
    }
  }
}

updateCategories().catch(console.error);
