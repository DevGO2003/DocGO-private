import { memo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@shared/components/Card';
import { Button } from '@shared/components/Button';
import { Eye, Edit, Trash2, Package } from 'lucide-react';
import { formatCurrency } from '@utils';
import { ProductCardProps } from './ProductCard.types';
import { productCardStyles } from './ProductCard.styles';

export const ProductCard = memo(({ product, onView, onEdit, onDelete }: ProductCardProps) => {
  return (
    <Card className={productCardStyles.card}>
      <CardHeader className="p-0">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className={productCardStyles.image} />
        ) : (
          <div className={productCardStyles.imagePlaceholder}>
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </CardHeader>
      <CardContent className={productCardStyles.content}>
        <CardTitle className={productCardStyles.title}>{product.name}</CardTitle>
        <p className={productCardStyles.description}>{product.description}</p>
        <div className="flex justify-between items-center">
          <span className={productCardStyles.price}>{formatCurrency(product.price)}</span>
          <span className={productCardStyles.stock}>Stock: {product.stock}</span>
        </div>
      </CardContent>
      <CardFooter className={productCardStyles.actions}>
        {onView && (
          <Button variant="outline" size="sm" onClick={() => onView(product.id)}>
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        )}
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(product.id)}>
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
        {onDelete && (
          <Button variant="destructive" size="sm" onClick={() => onDelete(product.id)}>
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';
