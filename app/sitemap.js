export default function sitemap() {
  return [
    {
      url: 'https://lashesbeautyok.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://lashesbeautyok.com/sitio',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]
}
