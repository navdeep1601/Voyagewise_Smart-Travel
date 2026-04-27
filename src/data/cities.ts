export interface City {
  name: string;
  state: string;
  code: string;
  lat: number;
  lng: number;
  popular: boolean;
}

export const CITIES: City[] = [
  { name: "Mumbai", state: "Maharashtra", code: "BOM", lat: 19.076, lng: 72.8777, popular: true },
  { name: "Delhi", state: "Delhi", code: "DEL", lat: 28.7041, lng: 77.1025, popular: true },
  { name: "Bangalore", state: "Karnataka", code: "BLR", lat: 12.9716, lng: 77.5946, popular: true },
  { name: "Chennai", state: "Tamil Nadu", code: "MAA", lat: 13.0827, lng: 80.2707, popular: true },
  { name: "Kolkata", state: "West Bengal", code: "CCU", lat: 22.5726, lng: 88.3639, popular: true },
  { name: "Hyderabad", state: "Telangana", code: "HYD", lat: 17.385, lng: 78.4867, popular: true },
  { name: "Pune", state: "Maharashtra", code: "PNQ", lat: 18.5204, lng: 73.8567, popular: true },
  { name: "Ahmedabad", state: "Gujarat", code: "AMD", lat: 23.0225, lng: 72.5714, popular: true },
  { name: "Jaipur", state: "Rajasthan", code: "JAI", lat: 26.9124, lng: 75.7873, popular: true },
  { name: "Lucknow", state: "Uttar Pradesh", code: "LKO", lat: 26.8467, lng: 80.9462, popular: true },
  { name: "Goa", state: "Goa", code: "GOI", lat: 15.2993, lng: 74.124, popular: true },
  { name: "Kochi", state: "Kerala", code: "COK", lat: 9.9312, lng: 76.2673, popular: true },
  { name: "Varanasi", state: "Uttar Pradesh", code: "VNS", lat: 25.3176, lng: 82.9739, popular: true },
  { name: "Chandigarh", state: "Chandigarh", code: "IXC", lat: 30.7333, lng: 76.7794, popular: false },
  { name: "Bhopal", state: "Madhya Pradesh", code: "BHO", lat: 23.2599, lng: 77.4126, popular: false },
  { name: "Nagpur", state: "Maharashtra", code: "NAG", lat: 21.1458, lng: 79.0882, popular: false },
  { name: "Patna", state: "Bihar", code: "PAT", lat: 25.6093, lng: 85.1376, popular: false },
  { name: "Indore", state: "Madhya Pradesh", code: "IDR", lat: 22.7196, lng: 75.8577, popular: false },
  { name: "Vadodara", state: "Gujarat", code: "BDQ", lat: 22.3072, lng: 73.1812, popular: false },
  { name: "Coimbatore", state: "Tamil Nadu", code: "CJB", lat: 11.0168, lng: 76.9558, popular: false },
  { name: "Visakhapatnam", state: "Andhra Pradesh", code: "VTZ", lat: 17.6868, lng: 83.2185, popular: false },
  { name: "Surat", state: "Gujarat", code: "STV", lat: 21.1702, lng: 72.8311, popular: false },
  { name: "Mysore", state: "Karnataka", code: "MYQ", lat: 12.2958, lng: 76.6394, popular: false },
  { name: "Udaipur", state: "Rajasthan", code: "UDR", lat: 24.5854, lng: 73.7125, popular: true },
  { name: "Amritsar", state: "Punjab", code: "ATQ", lat: 31.634, lng: 74.8723, popular: true },
  { name: "Jodhpur", state: "Rajasthan", code: "JDH", lat: 26.2389, lng: 73.0243, popular: false },
  { name: "Shimla", state: "Himachal Pradesh", code: "SLV", lat: 31.1048, lng: 77.1734, popular: true },
  { name: "Manali", state: "Himachal Pradesh", code: "KUU", lat: 32.2432, lng: 77.1892, popular: true },
  { name: "Rishikesh", state: "Uttarakhand", code: "RKSH", lat: 30.0869, lng: 78.2676, popular: true },
  { name: "Darjeeling", state: "West Bengal", code: "DJ", lat: 27.041, lng: 88.2663, popular: true },
  { name: "Guwahati", state: "Assam", code: "GAU", lat: 26.1445, lng: 91.7362, popular: false },
  { name: "Thiruvananthapuram", state: "Kerala", code: "TRV", lat: 8.5241, lng: 76.9366, popular: false },
  { name: "Bhubaneswar", state: "Odisha", code: "BBI", lat: 20.2961, lng: 85.8245, popular: false },
  { name: "Dehradun", state: "Uttarakhand", code: "DED", lat: 30.3165, lng: 78.0322, popular: false },
  { name: "Agra", state: "Uttar Pradesh", code: "AGR", lat: 27.1767, lng: 78.0081, popular: true },
  { name: "Jaisalmer", state: "Rajasthan", code: "JSA", lat: 26.9157, lng: 70.9083, popular: true },
  { name: "Madurai", state: "Tamil Nadu", code: "IXM", lat: 9.9252, lng: 78.1198, popular: false },
  { name: "Ranchi", state: "Jharkhand", code: "IXR", lat: 23.3441, lng: 85.3096, popular: false },
  { name: "Raipur", state: "Chhattisgarh", code: "RPR", lat: 21.2514, lng: 81.6296, popular: false },
  { name: "Leh", state: "Ladakh", code: "IXL", lat: 34.1526, lng: 77.5771, popular: true },
  { name: "Srinagar", state: "Jammu & Kashmir", code: "SXR", lat: 34.0837, lng: 74.7973, popular: true },
  { name: "Pondicherry", state: "Puducherry", code: "PNY", lat: 11.9416, lng: 79.8083, popular: false },
  { name: "Mangalore", state: "Karnataka", code: "IXE", lat: 12.9141, lng: 74.856, popular: false },
  { name: "Aurangabad", state: "Maharashtra", code: "IXU", lat: 19.8762, lng: 75.3433, popular: false },
  { name: "Jammu", state: "Jammu & Kashmir", code: "IXJ", lat: 32.7266, lng: 74.857, popular: false },
];
