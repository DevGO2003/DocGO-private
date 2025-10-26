import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@shared/layouts';
import { Button } from '@shared/components';
import { ProductForm } from '../components/ProductForm';
import { useProduct } from '../../models/api/productApi';
import { useProductEditController } from '../../controllers/useProductEditController';
import { ArrowLeft } from 'lucide-react';

export const ProductEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id!);
  const { handleCreate, handleUpdate, isCreating, isUpdating } = useProductEditController(id);

  const onSubmit = (data: any) => {
    if (id && id !== 'new') {
      handleUpdate(data);
    } else {
      handleCreate(data);
    }
  };

  if (isLoading && id !== 'new') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button variant="outline" onClick={() => navigate('/products')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ProductForm product={product} onSubmit={onSubmit} isLoading={isCreating || isUpdating} />
      </motion.div>
      </div>
    </DashboardLayout>
  );
};
