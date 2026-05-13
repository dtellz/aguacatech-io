/* =========================================================================
   Aguacatech, PayPal Smart Buttons integration
   ========================================================================= */

/* TODO before going live:
   1. Replace `client-id=sb` in buy.html with your real PayPal REST client id
      (Live, not Sandbox). https://developer.paypal.com/dashboard/applications/live
   2. To automate license-key delivery, configure a PayPal Webhook pointed at
      a small fulfillment endpoint (Cloudflare Worker, Vercel function, etc.)
      that listens for PAYMENT.CAPTURE.COMPLETED, generates a license key,
      and emails it. Until then, fulfillment is manual: you receive a PayPal
      email per purchase and reply with a key.
   3. The `sb` placeholder client id renders working buttons in PayPal's
      sandbox environment, clicking them does not move real money.
*/

(function () {
    if (typeof paypal === 'undefined') {
        console.warn('[Aguacatech] PayPal SDK did not load. Buttons disabled.');
        return;
    }

    const TIERS = {
        pro: {
            label: 'Aguacatech Pro',
            description: 'Aguacatech Pro, One-time license',
            amount: '29.00'
        },
        sentinel: {
            label: 'Aguacatech Sentinel',
            description: 'Aguacatech Sentinel, One-time license',
            amount: '49.00'
        },
        power: {
            label: 'Aguacatech Power',
            description: 'Aguacatech Power, One-time license',
            amount: '79.00'
        },
        bundle: {
            label: 'Aguacatech Everything bundle',
            description: 'Aguacatech Bundle, Pro + Sentinel + Power, one-time',
            amount: '129.00'
        }
    };

    function renderTier(tierId) {
        const tier = TIERS[tierId];
        const container = document.getElementById(`paypal-${tierId}`);
        if (!container || !tier) return;

        // Clear any previous render (e.g. on yearly/one-time toggle).
        container.innerHTML = '';

        paypal.Buttons({
            style: {
                layout: 'vertical',
                shape: 'rect',
                color: 'gold',
                label: 'paypal',
                height: 44
            },
            createOrder: function (_data, actions) {
                return actions.order.create({
                    intent: 'CAPTURE',
                    purchase_units: [{
                        amount: {
                            value: tier.amount,
                            currency_code: 'USD'
                        },
                        description: tier.description,
                        soft_descriptor: 'Aguacatech'
                    }],
                    application_context: {
                        brand_name: 'Aguacatech',
                        shipping_preference: 'NO_SHIPPING',
                        user_action: 'PAY_NOW'
                    }
                });
            },
            onApprove: function (_data, actions) {
                return actions.order.capture().then(function (details) {
                    const orderId = details.id || '';
                    const email = (details.payer && details.payer.email_address) || '';
                    const params = new URLSearchParams({
                        tier: tierId,
                        order: orderId,
                        email: email,
                        amount: tier.amount
                    });
                    window.location.href = `/success.html?${params.toString()}`;
                });
            },
            onError: function (err) {
                console.error('[Aguacatech] PayPal error', err);
                alert('Something went wrong with PayPal. Refresh and try again, or email support@aguacatech.eu.');
            },
            onCancel: function () {
                /* No-op: PayPal redraws the buttons. */
            }
        }).render(container).catch(function (err) {
            console.error('[Aguacatech] PayPal render failed', err);
            container.innerHTML = '<p style="color: var(--text-tertiary); font-size: 13px; text-align: center;">PayPal failed to load. Email <a href="mailto:support@aguacatech.eu" style="color: var(--green-light);">support@aguacatech.eu</a> to purchase by invoice.</p>';
        });
    }

    Object.keys(TIERS).forEach(renderTier);

    // Yearly/one-time toggle stubs. Real recurring subscriptions need a PayPal
    // billing plan id; until that's set up the toggle just shows a hint.
    document.querySelectorAll('[data-paypal-toggle]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            e.preventDefault();
            const tierId = a.dataset.paypalToggle;
            alert(`Yearly billing for ${TIERS[tierId].label} requires a PayPal subscription plan. Email support@aguacatech.eu and we'll send a recurring invoice link until automated subscriptions ship.`);
        });
    });
})();
