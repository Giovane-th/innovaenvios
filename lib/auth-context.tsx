import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  employee: Employee | null;
  employees: Employee[];
  
  // Autenticação
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  
  // Gerenciamento de funcionários (admin)
  createEmployee: (name: string, email: string, password: string, role?: 'admin' | 'user') => Promise<{ success: boolean; error?: string }>;
  deleteEmployee: (employeeId: string) => Promise<{ success: boolean; error?: string }>;
  listEmployees: () => Promise<Employee[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Carregar dados ao iniciar
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      // Não fazer auto-login - sempre mostrar tela de login
      // const storedEmployee = await SecureStore.getItemAsync('auth_employee');
      // if (storedEmployee) {
      //   const emp = JSON.parse(storedEmployee);
      //   setEmployee(emp);
      //   setIsAuthenticated(true);
      // }

      // Carregar lista de funcionários
      const storedEmployees = await AsyncStorage.getItem('employees_list');
      if (storedEmployees) {
        setEmployees(JSON.parse(storedEmployees));
      } else {
        // Se não existir, criar admin padrão
        const defaultAdmin: Employee = {
          id: 'admin-001',
          name: 'Administrador',
          email: 'admin@innovaenvios.app',
          role: 'admin',
          createdAt: new Date().toISOString(),
        };
        // Salvar senha padrão (123456)
        await SecureStore.setItemAsync(`pwd_${defaultAdmin.id}`, '123456');
        setEmployees([defaultAdmin]);
        await AsyncStorage.setItem('employees_list', JSON.stringify([defaultAdmin]));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Buscar funcionário
      const emp = employees.find((e) => e.email === email);
      if (!emp) {
        return { success: false, error: 'Funcionário não encontrado' };
      }

      // Verificar senha (em produção, usar hash)
      const storedPassword = await SecureStore.getItemAsync(`pwd_${emp.id}`);
      if (storedPassword !== password) {
        return { success: false, error: 'Senha incorreta' };
      }

      // Salvar funcionário logado
      await SecureStore.setItemAsync('auth_employee', JSON.stringify(emp));
      setEmployee(emp);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { success: false, error: 'Erro ao fazer login' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);

      // Verificar se email já existe
      if (employees.some((e) => e.email === email)) {
        return { success: false, error: 'Email já cadastrado' };
      }

      // Criar novo funcionário
      const newEmployee: Employee = {
        id: `emp_${Date.now()}`,
        name,
        email,
        role: 'user',
        createdAt: new Date().toISOString(),
      };

      // Salvar senha de forma segura
      await SecureStore.setItemAsync(`pwd_${newEmployee.id}`, password);

      // Adicionar à lista
      const updatedEmployees = [...employees, newEmployee];
      await AsyncStorage.setItem('employees_list', JSON.stringify(updatedEmployees));
      setEmployees(updatedEmployees);

      // Auto-login
      await SecureStore.setItemAsync('auth_employee', JSON.stringify(newEmployee));
      setEmployee(newEmployee);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error('Erro ao registrar:', error);
      return { success: false, error: 'Erro ao registrar' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await SecureStore.deleteItemAsync('auth_employee');
      setEmployee(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (
    name: string,
    email: string,
    password: string,
    role: 'admin' | 'user' = 'user'
  ) => {
    try {
      // Verificar se é admin
      if (employee?.role !== 'admin') {
        return { success: false, error: 'Apenas administradores podem criar funcionários' };
      }

      // Verificar se email já existe
      if (employees.some((e) => e.email === email)) {
        return { success: false, error: 'Email já cadastrado' };
      }

      // Criar novo funcionário
      const newEmployee: Employee = {
        id: `emp_${Date.now()}`,
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
      };

      // Salvar senha
      await SecureStore.setItemAsync(`pwd_${newEmployee.id}`, password);

      // Adicionar à lista
      const updatedEmployees = [...employees, newEmployee];
      await AsyncStorage.setItem('employees_list', JSON.stringify(updatedEmployees));
      setEmployees(updatedEmployees);

      return { success: true };
    } catch (error) {
      console.error('Erro ao criar funcionário:', error);
      return { success: false, error: 'Erro ao criar funcionário' };
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    try {
      // Verificar se é admin
      if (employee?.role !== 'admin') {
        return { success: false, error: 'Apenas administradores podem deletar funcionários' };
      }

      // Remover da lista
      const updatedEmployees = employees.filter((e) => e.id !== employeeId);
      await AsyncStorage.setItem('employees_list', JSON.stringify(updatedEmployees));
      setEmployees(updatedEmployees);

      // Remover senha
      await SecureStore.deleteItemAsync(`pwd_${employeeId}`);

      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar funcionário:', error);
      return { success: false, error: 'Erro ao deletar funcionário' };
    }
  };

  const listEmployees = async () => {
    return employees;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        employee,
        employees,
        login,
        register,
        logout,
        createEmployee,
        deleteEmployee,
        listEmployees,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
