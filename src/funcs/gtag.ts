export const GA_MEASUREMENT_ID = 'G-36NJ74203H';

export const pageview = (url: string) => {
  (window as any).gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

export const event = ({ action, category, label, value }: any) => {
  (window as any).gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
};