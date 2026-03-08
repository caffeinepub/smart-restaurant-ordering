import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  Loader2,
  LogIn,
  Pencil,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateMenuItem,
  useDeleteMenuItem,
  useGetMenu,
  useIsCallerAdmin,
  useToggleMenuItemAvailability,
  useUpdateMenuItem,
} from "../hooks/useQueries";
import type { MenuItem } from "../hooks/useQueries";

const CATEGORIES = ["Sabji", "Roti", "Rice", "Sides", "Drinks"];

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  Sabji: "/assets/generated/food-sabji.dim_600x400.jpg",
  Roti: "/assets/generated/food-roti.dim_600x400.jpg",
  Rice: "/assets/generated/food-rice.dim_600x400.jpg",
  Sides: "/assets/generated/food-sides.dim_600x400.jpg",
  Drinks: "/assets/generated/food-drinks.dim_600x400.jpg",
};

const formatINR = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface MenuItemFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
}

const defaultForm: MenuItemFormData = {
  name: "",
  description: "",
  price: "",
  category: "Sabji",
  imageUrl: "",
};

const DEFAULT_MENU_ITEMS = [
  // Sabji
  {
    name: "Paneer Butter Masala",
    description:
      "Soft paneer cubes in rich, creamy tomato-butter gravy with aromatic spices",
    price: 220,
    category: "Sabji",
    imageUrl: "",
  },
  {
    name: "Kadai Paneer",
    description:
      "Paneer and bell peppers cooked in a spiced onion-tomato masala in a kadai",
    price: 210,
    category: "Sabji",
    imageUrl: "",
  },
  {
    name: "Mix Veg",
    description: "Seasonal vegetables cooked in a mildly spiced gravy",
    price: 160,
    category: "Sabji",
    imageUrl: "",
  },
  {
    name: "Aloo Gobi",
    description:
      "Potato and cauliflower stir-fried with cumin and Indian spices",
    price: 140,
    category: "Sabji",
    imageUrl: "",
  },
  {
    name: "Bhindi Masala",
    description: "Crispy okra sauteed with onions, tomatoes, and spices",
    price: 150,
    category: "Sabji",
    imageUrl: "",
  },
  {
    name: "Chana Masala",
    description: "Hearty chickpeas in a tangy and spiced tomato-onion gravy",
    price: 160,
    category: "Sabji",
    imageUrl: "",
  },
  {
    name: "Dal Tadka",
    description:
      "Yellow lentils tempered with ghee, cumin, garlic, and dried chillies",
    price: 130,
    category: "Sabji",
    imageUrl: "",
  },
  {
    name: "Dal Fry",
    description:
      "Slow-cooked lentils fried with onions, tomatoes, and aromatic spices",
    price: 130,
    category: "Sabji",
    imageUrl: "",
  },
  // Roti
  {
    name: "Tandoori Roti",
    description: "Whole wheat bread baked fresh in a clay tandoor oven",
    price: 30,
    category: "Roti",
    imageUrl: "",
  },
  {
    name: "Butter Roti",
    description:
      "Soft whole wheat roti finished with a generous dollop of butter",
    price: 40,
    category: "Roti",
    imageUrl: "",
  },
  {
    name: "Plain Naan",
    description: "Soft leavened bread baked in a tandoor oven",
    price: 40,
    category: "Roti",
    imageUrl: "",
  },
  {
    name: "Butter Naan",
    description: "Fluffy tandoor bread brushed with melted butter",
    price: 50,
    category: "Roti",
    imageUrl: "",
  },
  {
    name: "Garlic Naan",
    description: "Naan topped with fresh garlic and butter, baked in a tandoor",
    price: 60,
    category: "Roti",
    imageUrl: "",
  },
  {
    name: "Lachha Paratha",
    description:
      "Flaky multi-layered whole wheat paratha, crisp on the outside",
    price: 60,
    category: "Roti",
    imageUrl: "",
  },
  // Rice
  {
    name: "Jeera Rice",
    description: "Fragrant basmati rice tempered with cumin seeds and ghee",
    price: 120,
    category: "Rice",
    imageUrl: "",
  },
  {
    name: "Plain Rice",
    description: "Steamed long-grain basmati rice",
    price: 90,
    category: "Rice",
    imageUrl: "",
  },
  {
    name: "Veg Biryani",
    description:
      "Aromatic basmati rice layered with spiced vegetables and saffron",
    price: 200,
    category: "Rice",
    imageUrl: "",
  },
  {
    name: "Paneer Biryani",
    description:
      "Fragrant biryani with marinated paneer, saffron, and caramelised onions",
    price: 240,
    category: "Rice",
    imageUrl: "",
  },
  {
    name: "Pulao",
    description:
      "Lightly spiced basmati rice cooked with whole spices and vegetables",
    price: 160,
    category: "Rice",
    imageUrl: "",
  },
  // Sides
  {
    name: "Green Salad",
    description: "Fresh cucumber, tomato, onion, and lemon wedge",
    price: 60,
    category: "Sides",
    imageUrl: "",
  },
  {
    name: "Boondi Raita",
    description: "Chilled yogurt with crispy boondi, cumin, and chaat masala",
    price: 70,
    category: "Sides",
    imageUrl: "",
  },
  {
    name: "Plain Curd",
    description: "Fresh homestyle yogurt, smooth and creamy",
    price: 50,
    category: "Sides",
    imageUrl: "",
  },
  {
    name: "Papad",
    description: "Crispy roasted lentil wafer served with mint chutney",
    price: 30,
    category: "Sides",
    imageUrl: "",
  },
  // Drinks
  {
    name: "Masala Chaas",
    description: "Spiced buttermilk with cumin, ginger, and fresh coriander",
    price: 60,
    category: "Drinks",
    imageUrl: "",
  },
  {
    name: "Lassi",
    description: "Thick and creamy chilled yogurt drink, sweet or salted",
    price: 80,
    category: "Drinks",
    imageUrl: "",
  },
  {
    name: "Lemon Soda",
    description: "Fresh lemon juice with soda water, served chilled",
    price: 60,
    category: "Drinks",
    imageUrl: "",
  },
  {
    name: "Mineral Water",
    description: "500ml chilled mineral water bottle",
    price: 30,
    category: "Drinks",
    imageUrl: "",
  },
];

function MenuItemForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel,
}: {
  initialData?: MenuItemFormData;
  onSubmit: (data: MenuItemFormData) => Promise<void>;
  isLoading: boolean;
  submitLabel: string;
}) {
  const [form, setForm] = useState<MenuItemFormData>(
    initialData ?? defaultForm,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      toast.error("Please fill in all required fields.");
      return;
    }
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name" className="font-ui text-sm mb-1 block">
            Name *
          </Label>
          <Input
            id="name"
            data-ocid="admin.input"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Grilled Salmon"
            className="font-ui"
            required
          />
        </div>

        <div>
          <Label htmlFor="price" className="font-ui text-sm mb-1 block">
            Price (₹) *
          </Label>
          <Input
            id="price"
            type="number"
            step="1"
            min="0"
            value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            placeholder="e.g. 299"
            className="font-ui"
            required
          />
        </div>

        <div>
          <Label htmlFor="category" className="font-ui text-sm mb-1 block">
            Category *
          </Label>
          <Select
            value={form.category}
            onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
          >
            <SelectTrigger className="font-ui" data-ocid="admin.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="font-ui">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="description" className="font-ui text-sm mb-1 block">
            Description
          </Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Describe the dish..."
            className="font-ui resize-none"
            rows={3}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="imageUrl" className="font-ui text-sm mb-1 block">
            Image URL
          </Label>
          <Input
            id="imageUrl"
            value={form.imageUrl}
            onChange={(e) =>
              setForm((p) => ({ ...p, imageUrl: e.target.value }))
            }
            placeholder="https://example.com/food-image.jpg"
            className="font-ui"
          />
          {/* Image preview */}
          <div className="mt-2 rounded-lg overflow-hidden border border-border h-32 bg-accent/20 flex items-center justify-center">
            <img
              src={
                form.imageUrl ||
                CATEGORY_FALLBACK_IMAGES[form.category] ||
                CATEGORY_FALLBACK_IMAGES.Sabji
              }
              alt="Preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  CATEGORY_FALLBACK_IMAGES[form.category] ??
                  CATEGORY_FALLBACK_IMAGES.Sabji;
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground font-ui mt-1">
            Paste a URL above to preview. Leave blank to use the category
            default image.
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button
          type="submit"
          disabled={isLoading}
          data-ocid="admin.save_button"
          className="font-ui font-semibold"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

function MenuItemRow({
  item,
  index,
}: {
  item: MenuItem;
  index: number;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const { mutateAsync: updateItem, isPending: isUpdating } =
    useUpdateMenuItem();
  const { mutateAsync: deleteItem, isPending: isDeleting } =
    useDeleteMenuItem();
  const { mutateAsync: toggleAvailability, isPending: isToggling } =
    useToggleMenuItemAvailability();

  const handleEdit = async (data: MenuItemFormData) => {
    try {
      await updateItem({
        id: item.id,
        name: data.name,
        description: data.description,
        price: Number.parseFloat(data.price),
        category: data.category,
        imageUrl: data.imageUrl,
      });
      toast.success("Menu item updated!");
      setEditOpen(false);
    } catch {
      toast.error("Failed to update item.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteItem(item.id);
      toast.success("Menu item deleted.");
    } catch {
      toast.error("Failed to delete item.");
    }
  };

  const handleToggle = async () => {
    try {
      await toggleAvailability(item.id);
    } catch {
      toast.error("Failed to update availability.");
    }
  };

  return (
    <TableRow data-ocid={`admin.item.${index + 1}`}>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-accent/30 flex-shrink-0 border border-border">
            <img
              src={
                item.imageUrl ||
                CATEGORY_FALLBACK_IMAGES[item.category] ||
                CATEGORY_FALLBACK_IMAGES.Sabji
              }
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  CATEGORY_FALLBACK_IMAGES[item.category] ??
                  CATEGORY_FALLBACK_IMAGES.Sabji;
              }}
            />
          </div>
          <div>
            <p className="font-ui font-semibold text-foreground text-sm">
              {item.name}
            </p>
            <p className="text-xs text-muted-foreground font-ui line-clamp-1">
              {item.description}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="font-ui text-xs">
          {item.category}
        </Badge>
      </TableCell>
      <TableCell className="font-ui font-semibold text-primary">
        {formatINR(item.price)}
      </TableCell>
      <TableCell>
        <Switch
          data-ocid={`admin.toggle.${index + 1}`}
          checked={item.available}
          onCheckedChange={handleToggle}
          disabled={isToggling}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {/* Edit dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                data-ocid={`admin.edit_button.${index + 1}`}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  Edit Menu Item
                </DialogTitle>
              </DialogHeader>
              <MenuItemForm
                initialData={{
                  name: item.name,
                  description: item.description,
                  price: item.price.toString(),
                  category: item.category,
                  imageUrl: item.imageUrl,
                }}
                onSubmit={handleEdit}
                isLoading={isUpdating}
                submitLabel="Save Changes"
              />
            </DialogContent>
          </Dialog>

          {/* Delete alert */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                data-ocid={`admin.delete_button.${index + 1}`}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="admin.dialog">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display">
                  Delete Menu Item?
                </AlertDialogTitle>
                <AlertDialogDescription className="font-ui">
                  This will permanently remove "{item.name}" from the menu. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className="font-ui"
                  data-ocid="admin.cancel_button"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="font-ui bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  data-ocid="admin.confirm_button"
                  onClick={handleDelete}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function AdminPanel() {
  const { login, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: menuItems = [], isLoading: menuLoading } = useGetMenu();
  const { mutateAsync: createItem, isPending: isCreating } =
    useCreateMenuItem();
  const [addOpen, setAddOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState(0);

  const handleCreate = async (data: MenuItemFormData) => {
    try {
      await createItem({
        name: data.name,
        description: data.description,
        price: Number.parseFloat(data.price),
        category: data.category,
        imageUrl: data.imageUrl,
      });
      toast.success("Menu item created!");
      setAddOpen(false);
    } catch {
      toast.error("Failed to create item.");
    }
  };

  const handleLoadDefaultMenu = async () => {
    setIsSeeding(true);
    setSeedProgress(0);
    try {
      for (let i = 0; i < DEFAULT_MENU_ITEMS.length; i++) {
        const item = DEFAULT_MENU_ITEMS[i];
        await createItem(item);
        setSeedProgress(i + 1);
      }
      toast.success("Default menu loaded successfully!");
    } catch {
      toast.error("Failed to load some menu items. Please try again.");
    } finally {
      setIsSeeding(false);
      setSeedProgress(0);
    }
  };

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div
          data-ocid="admin.loading_state"
          className="space-y-4 w-full max-w-2xl px-4"
        >
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center shadow-xs"
        >
          <Settings className="w-14 h-14 text-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Admin Access
          </h2>
          <p className="text-muted-foreground font-ui text-sm mb-6">
            This area is for restaurant administrators only. Please sign in to
            manage your menu and settings.
          </p>
          <Button
            data-ocid="auth.login_button"
            className="w-full font-ui font-semibold"
            size="lg"
            onClick={login}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4 mr-2" />
            )}
            {isLoggingIn ? "Signing In..." : "Sign In as Admin"}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-7 h-7 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground font-ui text-sm mt-1">
            Manage your restaurant's menu
          </p>
        </div>

        {/* Add Item dialog */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="admin.add_button"
              className="font-ui font-semibold gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" data-ocid="admin.dialog">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                Add Menu Item
              </DialogTitle>
            </DialogHeader>
            <MenuItemForm
              onSubmit={handleCreate}
              isLoading={isCreating}
              submitLabel="Add to Menu"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Menu items table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg text-foreground">
            Menu Items
          </h2>
          <Badge variant="outline" className="font-ui">
            {menuItems.length} items
          </Badge>
        </div>

        {menuLoading ? (
          <div className="p-6 space-y-3">
            {["a1", "a2", "a3", "a4", "a5"].map((k) => (
              <Skeleton key={k} className="h-14 w-full" />
            ))}
          </div>
        ) : menuItems.length === 0 ? (
          <div
            data-ocid="admin.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center px-6"
          >
            <div className="text-5xl mb-4">🍽️</div>
            <p className="font-ui text-foreground font-semibold text-lg mb-1">
              Your menu is empty
            </p>
            <p className="text-sm text-muted-foreground font-ui mb-6 max-w-xs">
              Load the default Indian menu with 27 dishes across all categories,
              or add items individually using "Add Item".
            </p>
            {isSeeding ? (
              <div
                data-ocid="admin.loading_state"
                className="flex flex-col items-center gap-3"
              >
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="font-ui text-sm font-medium text-foreground">
                  Loading {seedProgress}/{DEFAULT_MENU_ITEMS.length}...
                </p>
                <div className="w-48 h-2 bg-accent rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{
                      width: `${(seedProgress / DEFAULT_MENU_ITEMS.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <Button
                data-ocid="admin.primary_button"
                size="lg"
                className="font-ui font-semibold gap-2"
                onClick={handleLoadDefaultMenu}
              >
                <Plus className="w-4 h-4" />
                Load Default Menu
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-ui font-semibold">Item</TableHead>
                <TableHead className="font-ui font-semibold">
                  Category
                </TableHead>
                <TableHead className="font-ui font-semibold">Price</TableHead>
                <TableHead className="font-ui font-semibold">
                  Available
                </TableHead>
                <TableHead className="font-ui font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item, idx) => (
                <MenuItemRow key={item.id.toString()} item={item} index={idx} />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
