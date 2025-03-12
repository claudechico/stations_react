export interface User {
    id: string;
    username: string;
    email: string;
    phoneNumber: string;
    role: 'admin' | 'director' | 'manager';
  }
  
  export interface Company {
    id: string;
    name: string;
    email: string;
    countryId: string;
    directorId: string;
    director?: User;
  }
  
  export interface Station {
    id: string;
    companyId: string;
    managerId: string;
    tin: string;
    domainUrl: string;
    imageUrl: string;
    street: string;
    cityId: string;
    company?: Company;
    manager?: User;
  }
  
  export interface Country {
    id: string;
    name: string;
    code: string;
  }
  
  export interface Region {
    id: string;
    name: string;
    countryId: string;
  }
  
  export interface City {
    id: string;
    name: string;
    regionId: string;
  }