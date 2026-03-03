// MEMO: use `npm run production_local` to test this feature.
const useServiceWorker = () => {
    const getPushManager = async () => {
        if (!('Notification' in window)) return undefined;
        if (!('serviceWorker' in navigator)) return undefined;

        return await Promise.race([
            navigator.serviceWorker.ready,
            new Promise((resolve, _) => setTimeout(() => resolve(undefined), 1000)) as Promise<undefined>,
        ]).then(worker => {
            if (worker === undefined || !worker.pushManager) return undefined;
            return worker.pushManager;
        });
    };

    const subscribeToWebPush = async () => {
        const pushManager = await getPushManager();
        if (pushManager === undefined) {
            throw new Error('This Browser does not support Web Push.');
        }
        const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
        if (vapidPublicKey === undefined) {
            throw new Error('VAPID_PUBLIC_KEY not set.');
        }

        switch (window.Notification.permission) {
            case 'default':
                const result = await window.Notification.requestPermission();
                if (result !== 'granted') {
                    throw new Error('WebPush has been disabled. Try again.');
                }
                break;
            case 'denied':
                throw new Error('WebPush is blocked. Check your settings.');
            case 'granted':
                break;
        }

        const currentLocalSubscription = await pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidPublicKey,
        });

        return currentLocalSubscription.toJSON();
    };

    const unsubscribeFromWebPush = async () => {
        const pushManager = await getPushManager();
        if (pushManager === undefined) {
            throw new Error('pushManager undefined');
        }
        pushManager.getSubscription().then(subscription => {
            if (!subscription) {
                throw new Error('no active subscription');
            }
            subscription.unsubscribe().catch(e => {
                throw e;
            });
        });
    };

    return {
        getPushManager,
        subscribeToWebPush,
        unsubscribeFromWebPush,
    };
};

export default useServiceWorker;
