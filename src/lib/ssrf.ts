import dns from "dns/promises";
import net from "net";

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateIP(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  const v6 = ip.toLowerCase();
  const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  return (
    v6 === "::" ||
    v6 === "::1" ||
    v6.startsWith("fc") ||
    v6.startsWith("fd") ||
    v6.startsWith("fe8") ||
    v6.startsWith("fe9") ||
    v6.startsWith("fea") ||
    v6.startsWith("feb")
  );
}

/**
 * Throws if the host resolves to a loopback, private, link-local or otherwise
 * reserved address (blocks e.g. cloud metadata at 169.254.169.254).
 * Note: does not pin the resolved IP, so a DNS-rebinding gap remains.
 */
export async function assertPublicHost(hostname: string): Promise<void> {
  const host = hostname.replace(/^\[|\]$/g, "");
  if (
    host.toLowerCase() === "localhost" ||
    host.toLowerCase().endsWith(".localhost")
  ) {
    throw new Error("Requests to internal hosts are not allowed.");
  }
  const addresses = net.isIP(host)
    ? [{ address: host }]
    : await dns.lookup(host, { all: true });
  if (addresses.length === 0 || addresses.some((a) => isPrivateIP(a.address))) {
    throw new Error(
      "Requests to internal or private addresses are not allowed.",
    );
  }
}
