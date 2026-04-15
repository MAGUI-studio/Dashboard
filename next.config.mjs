import createNextIntlPlugin from "next-intl/plugin"
import withBundleAnalyzer from "@next/bundle-analyzer"

const withNextIntl = createNextIntlPlugin()

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

const nextConfig = {
  output: "standalone",
}

export default analyzer(withNextIntl(nextConfig))
