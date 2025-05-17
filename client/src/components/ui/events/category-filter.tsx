import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { Music, GraduationCap, Utensils, Laptop, Briefcase, Dumbbell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  selectedCategory: number | null;
  onCategorySelect: (categoryId: number | null) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategorySelect,
  searchTerm,
  onSearchChange,
}) => {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "music":
        return <Music className="text-primary mb-3 h-6 w-6" />;
      case "education":
        return <GraduationCap className="text-primary mb-3 h-6 w-6" />;
      case "food & drink":
        return <Utensils className="text-primary mb-3 h-6 w-6" />;
      case "technology":
        return <Laptop className="text-primary mb-3 h-6 w-6" />;
      case "business":
        return <Briefcase className="text-primary mb-3 h-6 w-6" />;
      case "health & fitness":
        return <Dumbbell className="text-primary mb-3 h-6 w-6" />;
      default:
        return <Music className="text-primary mb-3 h-6 w-6" />;
    }
  };
  
  return (
    <section className="bg-light py-4">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-lg font-medium mb-0">Browse by Category</h2>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="input-group flex w-full">
              <Input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <Button className="rounded-l-none">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="row g-3 mb-4">
          {isLoading ? (
            <div className="col-12 text-center py-4">Loading categories...</div>
          ) : (
            categories?.map((category) => (
              <div key={category.id} className="col-6 col-md-3 col-lg-2">
                <div 
                  className={`card bg-white shadow-sm text-center h-100 card-hover transition-all cursor-pointer ${
                    selectedCategory === category.id ? "border-primary border-2" : ""
                  }`}
                  onClick={() => {
                    if (selectedCategory === category.id) {
                      onCategorySelect(null);
                    } else {
                      onCategorySelect(category.id);
                    }
                  }}
                >
                  <div className="card-body d-flex flex-column justify-content-center py-4">
                    {getCategoryIcon(category.name)}
                    <h3 className="text-sm font-medium mb-0">{category.name}</h3>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
