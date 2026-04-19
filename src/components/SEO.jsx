import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, type, image, url }) => {
  const siteName = "Nathan Blog";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDescription = description || "Grounding executive strategy and pastoral influence in the radical, downward mobility of Jesus Christ.";
  const metaType = type || "website";
  const metaImage = image || "https://images.unsplash.com/photo-1549480111-738cb20da08e?auto=format&fit=crop&q=80&w=1200";
  const metaUrl = url ? `${window.location.origin}${url}` : window.location.href;

  return (
    <Helmet>
      {/* Standard SEO */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={metaType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
  );
};

export default SEO;
