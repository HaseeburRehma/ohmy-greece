/**
 * Shared, mail-client-safe layout for every Oh My Greece email.
 *
 * Nested tables + inline styles on every element, a 600px fluid container,
 * and a small <style> block that only *enhances* (mobile stacking, dark
 * mode). Clients that strip <style> still get a clean single column; Outlook
 * desktop gets a fixed-width ghost table via MSO conditionals.
 */

/** Public site origin, used for logo/image URLs and links inside emails. */
export const SITE = (process.env.SITE_URL || "https://www.ohmygreece.de").replace(/\/$/, "");

const C = {
  burgundy: "#3b001b",
  burgundyDeep: "#2a0013",
  teal: "#00d4d5",
  tealDeep: "#00cecf",
  sun: "#fee705",
  cream: "#fefae7",
  ink: "#3b001b",
  body: "#4d3340",
  muted: "#6b5c63",
  line: "#e8e3db",
  bg: "#fffef5",
  card: "#fefae7",
};

const FONT = `-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`;
const DISPLAY = `'Oswald','Arial Narrow','Helvetica Neue',Helvetica,Arial,sans-serif`;
const SCRIPT = `'Kaushan Script','Brush Script MT','Segoe Script',cursive`;

export const esc = (v: string) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

/** Teal pill above the headline (mirrors the site's eyebrow labels). */
export const eyebrow = (text: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;"><tr>
    <td style="background:${C.teal};border-radius:999px;padding:6px 14px;font-family:${FONT};font-size:11px;line-height:1;font-weight:700;letter-spacing:1.1px;text-transform:uppercase;color:${C.burgundy};">${esc(text)}</td>
  </tr></table>`;

/** Brush-script headline; `html` must already be escaped. */
export const heading = (html: string) =>
  `<h1 class="em-h1" style="margin:0 0 14px;font-family:${SCRIPT};font-size:34px;line-height:1.1;font-weight:400;color:${C.burgundy};">${html}</h1>`;

export const paragraph = (html: string, opts: { muted?: boolean; size?: number } = {}) =>
  `<p class="em-p" style="margin:0 0 16px;font-family:${FONT};font-size:${opts.size ?? 16}px;line-height:1.6;color:${opts.muted ? C.muted : C.body};">${html}</p>`;

/**
 * Label/value list in a cream card. Two columns on desktop; on phones
 * `em-stack` drops the label above the value.
 */
export const details = (title: string, rows: [string, string, string?][]) => {
  const body = rows
    .map(
      ([label, value, href], i) => `<tr>
        <td class="em-stack em-label" width="170" valign="top" style="padding:12px 0;${i ? `border-top:1px solid ${C.line};` : ""}font-family:${FONT};font-size:12px;line-height:1.4;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:${C.muted};">${esc(label)}</td>
        <td class="em-stack em-value" valign="top" style="padding:12px 0;${i ? `border-top:1px solid ${C.line};` : ""}font-family:${FONT};font-size:16px;line-height:1.45;font-weight:600;color:${C.ink};word-break:break-word;">${
          value
            ? href
              ? `<a href="${esc(href)}" style="color:${C.burgundy};text-decoration:underline;">${esc(value)}</a>`
              : esc(value)
            : "—"
        }</td>
      </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="em-cardwrap" style="margin:8px 0 24px;background:${C.card};border:1px solid ${C.line};border-radius:18px;">
    <tr><td class="em-card" style="padding:18px 22px 8px;">
      <p style="margin:0 0 4px;font-family:${DISPLAY};font-size:14px;line-height:1.3;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:${C.burgundy};">${esc(title)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${body}</table>
    </td></tr>
  </table>`;
};

/** Bulletproof pill button; full width on phones via `em-btn`. */
export const button = (label: string, href: string, variant: "sun" | "burgundy" = "sun") => {
  const bg = variant === "sun" ? C.sun : C.burgundy;
  const fg = variant === "sun" ? C.burgundy : "#ffffff";
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="em-btn" style="margin:4px 0 12px;">
    <tr><td align="center" bgcolor="${bg}" style="border-radius:999px;background:${bg};">
      <a href="${esc(href)}" target="_blank" style="display:inline-block;padding:16px 30px;font-family:${FONT};font-size:15px;line-height:1;font-weight:700;color:${fg};text-decoration:none;border-radius:999px;">${esc(label)}&nbsp;&nbsp;&rarr;</a>
    </td></tr>
  </table>`;
};

/** Numbered "what happens next" steps, alternating teal/sun like the site. */
export const steps = (title: string, items: string[]) =>
  `<p style="margin:8px 0 14px;font-family:${DISPLAY};font-size:14px;line-height:1.3;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:${C.burgundy};">${esc(title)}</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
    ${items
      .map(
        (t, i) => `<tr>
      <td width="46" valign="top" style="padding:0 0 14px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td align="center" valign="middle" width="34" height="30" style="width:34px;height:30px;border-radius:999px;background:${i % 2 ? C.sun : C.teal};font-family:${DISPLAY};font-size:14px;font-weight:700;line-height:30px;color:${C.burgundy};">${String(i + 1).padStart(2, "0")}</td>
        </tr></table>
      </td>
      <td valign="top" class="em-text" style="padding:5px 0 14px;font-family:${FONT};font-size:15px;line-height:1.55;color:${C.body};">${esc(t)}</td>
    </tr>`,
      )
      .join("")}
  </table>`;

export const signoff = () =>
  paragraph(`Bis bald,<br/><strong style="color:${C.burgundy};">deine Oh My Greece Familie</strong>`);

/* ------------------------------------------------------------------ */
/* Page shell                                                          */
/* ------------------------------------------------------------------ */

export function emailShell({
  title,
  preheader,
  body,
  audience = "customer",
  site = SITE,
}: {
  title: string;
  /** inbox preview line (hidden in the body) */
  preheader: string;
  body: string;
  /** internal notifications get a slimmer footer */
  audience?: "customer" | "team";
  /** origin for images/links; the dev preview passes the local origin */
  site?: string;
}) {
  const footer =
    audience === "customer"
      ? `<tr><td class="em-pad" style="padding:28px 40px 6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td class="em-stack" width="50%" valign="top" style="padding:0 12px 16px 0;font-family:${FONT};font-size:13px;line-height:1.55;color:${C.burgundy};">
              <strong style="font-family:${DISPLAY};font-size:15px;">Adresse</strong><br/>Oh My Greece<br/>Deutzer Freiheit 82<br/>50679 Köln
            </td>
            <td class="em-stack" width="50%" valign="top" style="padding:0 0 16px;font-family:${FONT};font-size:13px;line-height:1.55;color:${C.burgundy};">
              <strong style="font-family:${DISPLAY};font-size:15px;">Öffnungszeiten</strong><br/>Dienstags – Sonntags<br/>11:00 bis 22:00 Uhr
            </td>
          </tr></table>
        </td></tr>`
      : "";

  return `<!doctype html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<meta name="x-apple-disable-message-reformatting"/>
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no"/>
<meta name="color-scheme" content="light dark"/>
<meta name="supported-color-schemes" content="light dark"/>
<title>${esc(title)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<link href="https://fonts.googleapis.com/css2?family=Kaushan+Script&family=Oswald:wght@600;700&display=swap" rel="stylesheet"/>
<style>
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none;}
  a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;}
  @media only screen and (max-width:620px){
    .em-wrap{padding:0!important;}
    .em-container{width:100%!important;border-radius:0!important;}
    .em-pad{padding-left:22px!important;padding-right:22px!important;}
    .em-hero{padding:30px 22px 22px!important;}
    .em-h1{font-size:29px!important;}
    .em-p{font-size:15px!important;}
    .em-card{padding:14px 16px 6px!important;}
    .em-stack{display:block!important;width:100%!important;box-sizing:border-box;}
    .em-label{padding:12px 0 2px!important;}
    .em-value{padding:0 0 12px!important;border-top:0!important;}
    .em-btn{width:100%!important;}
    .em-btn a{display:block!important;}
  }
  @media (prefers-color-scheme:dark){
    .em-body,.em-wrap{background:#1a0710!important;}
    .em-container,.em-hero{background:#260a17!important;}
    .em-cardwrap{background:#33101f!important;border-color:#4a1c30!important;}
    .em-h1{color:#fee705!important;}
    .em-p,.em-value,.em-text{color:#f6ecef!important;}
    .em-value a{color:#00d4d5!important;}
  }
</style>
</head>
<body class="em-body" style="margin:0;padding:0;width:100%;background:${C.bg};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:${C.bg};">${esc(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="em-wrap" style="background:${C.bg};padding:28px 12px;">
    <tr><td align="center">
      <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="em-container" style="width:100%;max-width:600px;background:#ffffff;border:1px solid ${C.line};border-radius:28px;overflow:hidden;">
        <!-- Header: teal bar like the site navigation -->
        <tr><td style="background:${C.tealDeep};padding:18px 32px;" class="em-pad">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td valign="middle" width="64">
              <a href="${esc(site)}" target="_blank"><img src="${esc(site)}/images/logo-oh-my-greece.png" width="60" height="60" alt="Oh My Greece" style="display:block;width:60px;height:60px;border-radius:999px;font-family:${FONT};font-size:12px;color:${C.burgundy};"/></a>
            </td>
            <td valign="middle" align="right" style="font-family:${FONT};font-size:12px;line-height:1.3;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#ffffff;">
              Franchise&nbsp;Programm
            </td>
          </tr></table>
        </td></tr>
        <tr><td height="6" style="height:6px;line-height:6px;font-size:6px;background:${C.sun};">&nbsp;</td></tr>
        <!-- Body -->
        <tr><td class="em-hero em-text" style="padding:40px 40px 26px;background:#ffffff;">${body}</td></tr>
        <!-- Footer: teal card like the site footer -->
        <tr><td style="background:${C.tealDeep};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${footer}
            <tr><td class="em-pad" style="padding:${audience === "customer" ? "4px" : "22px"} 40px 8px;font-family:${SCRIPT};font-size:30px;line-height:1.1;color:${C.sun};">Oh My Greece</td></tr>
            <tr><td class="em-pad" style="padding:4px 40px 26px;font-family:${FONT};font-size:12px;line-height:1.6;color:${C.burgundy};">
              <a href="mailto:info@ohmygreece.de" style="color:${C.burgundy};">info@ohmygreece.de</a>
              &nbsp;·&nbsp;<a href="${esc(site)}/impressum" style="color:${C.burgundy};">Impressum</a>
              &nbsp;·&nbsp;<a href="${esc(site)}/datenschutz" style="color:${C.burgundy};">Datenschutz</a>
            </td></tr>
          </table>
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>
</body>
</html>`;
}
