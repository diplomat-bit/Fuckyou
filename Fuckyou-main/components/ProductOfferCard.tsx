import React from 'react';
import { Plus, Minus, Check, ShoppingCart } from 'lucide-react';

interface ProductOfferProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  type: 'counter' | 'cross-sell' | 'suggested';
  isSelected?: boolean;
  onToggle: (id: string) => void;
  quantity?: number;
  onQuantityChange?: (id: string, quantity: number) => void;
}

export const ProductOfferCard: React.FC<ProductOfferProps> = ({
  id,
  title,
  price,
  originalPrice,
  imageUrl,
  type,
  isSelected = false,
  onToggle,
  quantity = 1,
  onQuantityChange,
}) => {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div
      className={`relative flex flex-col p-4 rounded-xl border-2 transition-all duration-200 ${
        isSelected ? 'border-blue-600 bg-blue-50/30' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {discount > 0 && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
          -{discount}%
        </span>
      )}

      <div className="flex gap-4">
        <img src={imageUrl} alt={title} className="w-20 h-20 object-cover rounded-lg" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{title}</h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">${price.toFixed(2)}</span>
            {originalPrice && (
              <span className="text-xs text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        {type === 'counter' && onQuantityChange ? (
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => onQuantityChange(id, Math.max(1, quantity - 1))}
              className="p-1 hover:bg-gray-100"
            >
              <Minus size={14} />
            </button>
            <span className="px-3 text-sm font-medium">{quantity}</span>
            <button
              onClick={() => onQuantityChange(id, quantity + 1)}
              className="p-1 hover:bg-gray-100"
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <div />
        )}

        <button
          onClick={() => onToggle(id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isSelected
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {isSelected ? (
            <>
              <Check size={16} /> Selected
            </>
          ) : (
            <>
              <ShoppingCart size={16} /> Add
            </>
          )}
        </button>
      </div>
    </div>
  );
};