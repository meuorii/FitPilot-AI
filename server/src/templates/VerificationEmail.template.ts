const renderCodeBoxes = (verificationCode: string) => {
  return verificationCode
    .split('')
    .map((digit) => `<td align="center" valign="middle" width="62" height="70" style="width:62px;height:70px;background:#ffffff;border:1px solid #d7e3f2;border-radius:13px;color:#102445;font-size:32px;line-height:70px;font-weight:700;">${digit}</td>`)
    .join('');
};

export const verificationEmailTemplate = (verificationCode: string): string => {
  const codeBoxes = renderCodeBoxes(verificationCode);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @media only screen and (max-width: 620px) {
        .email-shell { width: 100% !important; }
        .mobile-padding { padding-left: 24px !important; padding-right: 24px !important; }
        .hero-left, .hero-right { display: block !important; width: 100% !important; }
        .hero-right { text-align: center !important; padding-top: 24px !important; }
        .hero-image { width: 280px !important; max-width: 100% !important; margin: 0 auto !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f7fb;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f7fb;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="680" cellspacing="0" cellpadding="0" border="0" class="email-shell" style="width:680px;max-width:680px;background:#ffffff;border:1px solid #e6eaf0;border-radius:24px;overflow:hidden;">
            <!-- LOGO -->
            <tr>
              <td class="mobile-padding" style="padding:42px 54px 20px;">
                <img src="YOUR_DIRECT_FITPILOT_LOGO_URL" alt="FitPilot" width="155" style="width:155px;height:auto;display:block;" />
              </td>
            </tr>
            <!-- HERO -->
            <tr>
              <td class="mobile-padding" style="padding:18px 54px 10px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td width="48%" valign="middle" class="hero-left" style="width:48%;vertical-align:middle;padding-right:16px;">
                      <p style="margin:0 0 12px;color:#142847;font-size:18px;">Hi there! 👋</p>
                      <h1 style="margin:0 0 22px;color:#0e2345;font-size:38px;line-height:1.13;font-weight:800;">Your verification<br />code <span style="color:#35aeea;">is here.</span></h1>
                      <p style="margin:0;color:#344967;font-size:15px;line-height:1.8;">Use the 6-digit code below to verify your email address and continue setting up your <strong style="color:#142847;">FitPilot AI</strong> account.</p>
                    </td>
                    <td width="52%" align="center" valign="bottom" class="hero-right" style="width:52%;">
                      <img src="YOUR_DIRECT_ROCCO_IMAGE_URL" alt="Rocco with your verification code" width="335" class="hero-image" style="width:335px;max-width:335px;height:auto;display:block;margin:0 auto;" />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- CODE -->
            <tr>
              <td align="center" class="mobile-padding" style="padding:10px 54px 36px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #dce8f7;border-radius:18px;">
                  <tr>
                    <td align="center" style="padding:24px 20px 10px;">
                      <p style="margin:0;color:#6989b7;font-size:12px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;">Your Verification Code</p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:8px 18px 26px;">
                      <table role="presentation" cellspacing="7" cellpadding="0" border="0" align="center">
                        <tr>
                          ${codeBoxes}
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- SECURITY INFO -->
            <tr>
              <td class="mobile-padding" style="padding:4px 54px 42px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td width="50%" valign="top" style="padding-right:18px;">
                      <p style="margin:0 0 6px;color:#17345b;font-size:14px;font-weight:700;">Haven't requested this?</p>
                      <p style="margin:0;color:#657b98;font-size:12px;line-height:1.65;">If you didn't request a verification code, you can safely ignore this email.</p>
                    </td>
                    <td width="50%" valign="top" style="padding-left:22px;border-left:1px solid #e2e8f0;">
                      <p style="margin:0 0 6px;color:#17345b;font-size:14px;font-weight:700;">Code expires in 10 minutes.</p>
                      <p style="margin:0;color:#657b98;font-size:12px;line-height:1.65;">For your security, this verification code will expire shortly.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- FOOTER -->
            <tr>
              <td class="mobile-padding" style="padding:32px 54px;background-color:#f4f8fd;border-top:1px solid #e5edf6;">
                <img src="YOUR_DIRECT_FITPILOT_LOGO_URL" alt="FitPilot" width="125" style="width:125px;height:auto;display:block;margin-bottom:12px;" />
                <p style="margin:0 0 4px;color:#506985;font-size:12px;">Your AI-powered fitness companion.</p>
                <p style="margin:0 0 18px;color:#506985;font-size:12px;">Stronger workouts. Smarter nutrition. Better you.</p>
                <p style="margin:0;color:#94a3b8;font-size:10px;line-height:1.6;">© ${new Date().getFullYear()} FitPilot AI. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};