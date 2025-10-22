import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@shared/layouts';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@shared/components';
import { useProduct } from '../../../models/api/productApi';
import { formatCurrency, formatDate } from '@utils';
import { ArrowLeft, Edit, Package } from 'lucide-react';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(id!);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error || !product) {
    return <div className="flex justify-center items-center min-h-screen">Product not found</div>;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
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
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <div>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <Package className="w-32 h-32 text-gray-400" />
            </div>
          )}
        </div>

        <Card animated>
          <CardHeader>
            <CardTitle className="text-3xl">{product.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p className="mt-1">{product.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
              <p className="text-2xl font-bold text-primary mt-1">
                {formatCurrency(product.price)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                <p className="mt-1">{product.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Stock</h3>
                <p className="mt-1">{product.stock} units</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
              <p className="mt-1">{formatDate(product.createdAt)}</p>
            </div>

            <Button variant="primary" animated onClick={() => navigate(`/products/${id}/edit`)} className="w-full">
              <Edit className="w-4 h-4 mr-2" />
              Edit Product
            </Button>
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </DashboardLayout>
  );
};
