import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { Input, Button, Card, CardContent, CardHeader, CardTitle } from '@shared/components';
import { Product } from '../../models/types/product.types';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const ProductForm = ({ product, onSubmit, isLoading }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category || '',
    stock: product?.stock || 0,
    imageUrl: product?.imageUrl || '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
    }));
  };

  return (
    <Card animated>
      <CardHeader>
        <CardTitle>{product ? 'Edit Product' : 'Create Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            name="name"
            label="Product Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            required
          />
          <Input
            name="price"
            label="Price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
          />
          <Input
            name="category"
            label="Category"
            value={formData.category}
            onChange={handleChange}
            required
          />
          <Input
            name="stock"
            label="Stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            required
          />
          <Input
            name="imageUrl"
            label="Image URL"
            value={formData.imageUrl}
            onChange={handleChange}
          />
          <Button type="submit" variant="primary" animated isLoading={isLoading} className="w-full">
            {product ? 'Update Product' : 'Create Product'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
