export default function SecureImage({ src, alt, className, style, ...props }) {
  return <img src={src} alt={alt} className={className} style={style} {...props} />;
}
