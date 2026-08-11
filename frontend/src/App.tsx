import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CustomerList } from './pages/CustomerList';
import { CustomerForm } from './pages/CustomerForm';
import { CustomerDetail } from './pages/CustomerDetail';
import { ProductList } from './pages/ProductList';
import { ProductForm } from './pages/ProductForm';
import { ProductDetail } from './pages/ProductDetail';
import { ChallanList } from './pages/ChallanList';
import { ChallanForm } from './pages/ChallanForm';
import { ChallanDetail } from './pages/ChallanDetail';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              
              {/* Customers (Viewable by ADMIN, SALES, ACCOUNTS) */}
              <Route element={<RoleRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']} />}>
                <Route path="/customers" element={<CustomerList />} />
                <Route path="/customers/:id" element={<CustomerDetail />} />
              </Route>
              
              {/* Customer Editing (Only ADMIN, SALES) */}
              <Route element={<RoleRoute allowedRoles={['ADMIN', 'SALES']} />}>
                <Route path="/customers/new" element={<CustomerForm />} />
                <Route path="/customers/:id/edit" element={<CustomerForm />} />
              </Route>
              
              {/* Products (Viewable by All) */}
              <Route element={<RoleRoute allowedRoles={['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS']} />}>
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/inventory" element={<ProductList />} />
              </Route>
              
              {/* Product Editing (Only ADMIN, WAREHOUSE) */}
              <Route element={<RoleRoute allowedRoles={['ADMIN', 'WAREHOUSE']} />}>
                <Route path="/products/new" element={<ProductForm />} />
                <Route path="/products/:id/edit" element={<ProductForm />} />
              </Route>
              
              {/* Challans (Viewable by All) */}
              <Route element={<RoleRoute allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']} />}>
                <Route path="/challans" element={<ChallanList />} />
                <Route path="/challans/:id" element={<ChallanDetail />} />
              </Route>
              
              {/* Challan Creation (Only ADMIN, SALES) */}
              <Route element={<RoleRoute allowedRoles={['ADMIN', 'SALES']} />}>
                <Route path="/challans/new" element={<ChallanForm />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

