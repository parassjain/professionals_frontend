import {
  Wrench, Hammer, Zap, Droplets, Scissors, Laptop, Code, Globe,
  Heart, Baby, Dog, Car, Home, Truck, Package, Users,
  GraduationCap, Stethoscope, ChefHat, Camera, Video, Music, Palette,
  BookOpen, PenTool, Calculator, FileText, Briefcase, Shield,
  Dumbbell, Monitor, Smartphone, Wifi, Brush, Leaf, PawPrint,
  Plane, Bus, Scroll, Book, Mic, TestTube,
  Activity, PersonStanding, Accessibility, Waves, Sparkle,
  Utensils
} from 'lucide-react';

const iconMap = {
  'home-help': Users,
  'maid': Scissors,
  'cook': ChefHat,
  'driver': Car,
  'baby-sitter': Baby,
  'elder-care': PersonStanding,
  'nanny': Baby,
  'housekeeper': Home,
  
  'home-repair': Wrench,
  'plumber': Droplets,
  'electrician': Zap,
  'carpenter': Hammer,
  'ac-repair': Monitor,
  'appliance-repair': Monitor,
  'painter': Brush,
  'pest-control': Shield,
  
  'driving': Car,
  'personal-driver': Car,
  'car-rental': Car,
  'airport-pickup': Plane,
  'intercity-driver': Bus,
  
  'tutoring': GraduationCap,
  'math-tutor': Calculator,
  'physics-tutor': Book,
  'chemistry-tutor': TestTube,
  'english-tutor': Book,
  'science-tutor': Book,
  'computer-tutor': Code,
  'test-prep': Scroll,
  
  'beauty': Sparkle,
  'salon-at-home': Scissors,
  'makeup-artist': Sparkle,
  'mehendi-artist': PenTool,
  'nail-artist': Sparkle,
  'spa-at-home': Waves,
  
  'health-fitness': Activity,
  'personal-trainer': Dumbbell,
  'yoga-instructor': PersonStanding,
  'dietitian': Heart,
  'physiotherapist': Accessibility,
  'massage-therapist': Accessibility,
  
  'pet-care': PawPrint,
  'pet-sitter': Home,
  'dog-walker': Dog,
  'pet-groomer': Scissors,
  'veterinarian': Stethoscope,
  
  'events': Camera,
  'photographer': Camera,
  'videographer': Video,
  'caterer': Utensils,
  'bartender': Heart,
  
  'technology': Laptop,
  'computer-repair': Monitor,
  'mobile-repair': Smartphone,
  'web-developer': Code,
  'wifi-setup': Wifi,
};

const defaultIcons = {
  'home-help': Users,
  'home-repair': Wrench,
  'driving': Car,
  'tutoring': GraduationCap,
  'beauty': Sparkle,
  'health-fitness': Activity,
  'pet-care': PawPrint,
  'events': Camera,
  'technology': Laptop,
};

function normalizeSlug(name) {
  return name?.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function getIconComponent(slugOrName) {
  const slug = normalizeSlug(slugOrName);
  const name = slugOrName?.toLowerCase() || '';
  
  if (iconMap[slug]) return iconMap[slug];
  
  for (const [key, Icon] of Object.entries(iconMap)) {
    if (slug.includes(key) || name.includes(key)) return Icon;
  }
  
  for (const [key, Icon] of Object.entries(defaultIcons)) {
    if (slug.includes(key) || name.includes(key)) return Icon;
  }
  
  return Briefcase;
}

export default function CategoryIcon({ icon, slug, name, size = 56, className = '' }) {
  if (icon) {
    return <img src={icon} alt={name || slug} className={className} style={{ width: size, height: size }} />;
  }
  
  const IconComponent = getIconComponent(slug || name);
  return <IconComponent size={size} className={className} />;
}