export const GA_MEASUREMENT_ID = 'G-36NJ74203H';

export interface GTagEvent {
  action: string;
  category: string;
  label: string;
  value: number;
}

export const pageview = (url: string) => {
  if(!window) return;

  (window as any).gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

export const event = ({ action, category, label, value }: GTagEvent) => {
  if(!window) return;
  
  (window as any).gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
};