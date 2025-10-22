import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@shared/components/Button';
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" onClick={() => navigate('/products')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Products
      </Button>

      <ProductForm product={product} onSubmit={onSubmit} isLoading={isCreating || isUpdating} />
    </div>
  );
};
