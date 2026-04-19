import {
  Wrench, Hammer, Paintbrush, Drill, Zap, Droplets, Scissors,
  Laptop, Code, Globe, ShoppingCart, Heart, Baby, Dog, Cat,
  Trees, Car, Home, Building, Truck, Package, Users, UserCheck,
  GraduationCap, FlaskConical, Stethoscope, Pill, Plus, Banknote,
  UtensilsCrossed, Coffee, ChefHat, Camera, Video, Music, Palette,
  BookOpen, PenTool, Calculator, FileText, Briefcase, ClipboardList,
  Shield, Lock, Key, Eye, Mail, Phone, MapPin, Calendar, Clock,
  Star, Award, Trophy, Medal, Gift, PartyPopper, Sparkles
} from 'lucide-react';

const iconMap = {
  'plumbing': Droplets,
  'electrical': Zap,
  'carpentry': Hammer,
  'painting': Paintbrush,
  'cleaning': Droplets,
  'moving': Truck,
  'pool': Droplets,
  'hvac': Zap,
  'roofing': Home,
  'landscaping': Trees,
  'pets': Dog,
  'tutoring': GraduationCap,
  'technology': Laptop,
  'web-design': Code,
  'accounting': Calculator,
  'legal': FileText,
  'health': Stethoscope,
  'fitness': Heart,
  'beauty': Scissors,
  'photography': Camera,
  'videography': Video,
  'music': Music,
  'design': Palette,
  'writing': PenTool,
  'cooking': ChefHat,
  'baby': Baby,
  'senior-care': Users,
  'personal-trainer': Heart,
  'language': Globe,
  'online': Globe,
  'home-repair': Wrench,
  'handyman': Wrench,
  'auto': Car,
  'delivery': Package,
  'security': Shield,
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
  
  return Briefcase;
}

export default function CategoryIcon({ icon, slug, name, size = 56, className = '' }) {
  if (icon) {
    return <img src={icon} alt={name || slug} className={className} style={{ width: size, height: size }} />;
  }
  
  const IconComponent = getIconComponent(slug || name);
  return <IconComponent size={size} className={className} />;
}