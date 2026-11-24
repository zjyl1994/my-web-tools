const serviceWorker = 'serviceWorker' in navigator ? navigator.serviceWorker : undefined;
let pageController = serviceWorker?.controller;

if (serviceWorker && !pageController) {
  const captureController = () => {
    if (!serviceWorker.controller) return;
    pageController = serviceWorker.controller;
    serviceWorker.removeEventListener('controllerchange', captureController);
  };
  serviceWorker.addEventListener('controllerchange', captureController);
}

function waitForActivation(worker: ServiceWorker) {
  return new Promise<void>((resolve, reject) => {
    const finish = (error?: Error) => {
      window.clearTimeout(timeout);
      worker.removeEventListener('statechange', checkState);
      if (error) reject(error);
      else resolve();
    };
    const checkState = () => {
      if (worker.state === 'activated') finish();
      if (worker.state === 'redundant') finish(new Error('Service worker update failed'));
    };
    const timeout = window.setTimeout(() => finish(new Error('Service worker activation timed out')), 20000);
    worker.addEventListener('statechange', checkState);
    checkState();
  });
}

export async function checkForPwaUpdate() {
  const registration = await serviceWorker?.getRegistration();
  const previous = registration?.active;
  if (!registration || !previous) return 'unavailable';
  if (pageController && serviceWorker?.controller && serviceWorker.controller !== pageController) return 'updated';

  await registration.update();
  if (pageController && serviceWorker?.controller && serviceWorker.controller !== pageController) return 'updated';
  const next = registration.installing ?? registration.waiting ?? registration.active;
  if (!next || next === previous) return 'current';

  await waitForActivation(next);
  return 'updated';
}
