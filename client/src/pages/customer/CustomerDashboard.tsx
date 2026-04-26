import { useEffect, useMemo, useState } from "react";
import {
  FiClock,
  FiCoffee,
  FiFilter,
  FiMapPin,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiShoppingBag,
  FiShoppingCart,
} from "react-icons/fi";
import ThreeDotsLoader from "../../components/common/ThreeDotsLoader";
import useCurrentUser from "../../customhooks/useCurrentUser";
import {
  createPublicOrder,
  getPublicPreparedMenu,
  getPublicRestaurants,
  type PublicPreparedItem,
  type PublicRestaurant,
} from "../../services/publicService";

const formatCurrency = (value?: number) => `Rs ${(value ?? 0).toLocaleString("en-IN")}`;

type CartItem = PublicPreparedItem & { quantity: number };

const CustomerDashboard = () => {
  const { user, loading: userLoading } = useCurrentUser();
  const [restaurants, setRestaurants] = useState<PublicRestaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [items, setItems] = useState<PublicPreparedItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadMenu = async (restaurantId: string) => {
    try {
      setMenuLoading(true);
      setError(null);
      const preparedItems = await getPublicPreparedMenu(restaurantId);
      setItems(preparedItems);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load prepared menu.");
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "customer") {
      return;
    }

    let active = true;

    const loadRestaurantsAndMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPublicRestaurants();
        if (!active) {
          return;
        }

        setRestaurants(data);
        const defaultRestaurantId = data[0]?._id ?? "";
        setSelectedRestaurantId((current) => current || defaultRestaurantId);

        if (defaultRestaurantId) {
          const preparedItems = await getPublicPreparedMenu(defaultRestaurantId);
          if (active) {
            setItems(preparedItems);
          }
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load customer dashboard.");
        }
      } finally {
        if (active) {
          setLoading(false);
          setMenuLoading(false);
        }
      }
    };

    void loadRestaurantsAndMenu();

    return () => {
      active = false;
    };
  }, [user]);

  const selectedRestaurant = restaurants.find(
    (restaurant) => restaurant._id === selectedRestaurantId
  );

  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.category || "Chef Specials"))),
    [items]
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const next = items
      .filter((item) => {
        const matchesSearch =
          !normalizedSearch ||
          [item.name, item.description, item.category]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesCategory =
          selectedCategory === "all" || (item.category || "Chef Specials") === selectedCategory;

        const matchesAvailability =
          availabilityFilter === "all" ||
          (availabilityFilter === "available" && item.inStock) ||
          (availabilityFilter === "sold_out" && !item.inStock);

        return matchesSearch && matchesCategory && matchesAvailability;
      })
      .slice();

    if (sortBy === "price_low") {
      next.sort((left, right) => left.price - right.price);
    } else if (sortBy === "price_high") {
      next.sort((left, right) => right.price - left.price);
    } else if (sortBy === "availability") {
      next.sort((left, right) => right.availableQuantity - left.availableQuantity);
    }

    return next;
  }, [availabilityFilter, items, searchTerm, selectedCategory, sortBy]);

  const inStockItems = useMemo(
    () => items.filter((item) => item.inStock),
    [items]
  );

  const featuredItems = useMemo(
    () => filteredItems.slice(0, 3),
    [filteredItems]
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const addToCart = (item: PublicPreparedItem) => {
    if (!item.inStock || !item.isOrderable || !item.menuId) {
      return;
    }

    setCart((current) => {
      const existing = current.find((entry) => entry._id === item._id);
      if (existing) {
        return current.map((entry) =>
          entry._id === item._id
            ? {
                ...entry,
                quantity: Math.min(entry.quantity + 1, item.availableQuantity),
              }
            : entry
        );
      }

      return [...current, { ...item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((current) => current.filter((entry) => entry._id !== itemId));
      return;
    }

    setCart((current) =>
      current.map((entry) =>
        entry._id === itemId
          ? { ...entry, quantity: Math.min(quantity, entry.availableQuantity) }
          : entry
      )
    );
  };

  const handlePlaceOrder = async () => {
    if (!selectedRestaurantId) {
      setError("Select a restaurant before placing the order.");
      return;
    }

    if (!cart.length) {
      setError("Add at least one prepared item to the cart.");
      return;
    }

    if (!address.trim()) {
      setError("Delivery address is required.");
      return;
    }

    try {
      setSubmittingOrder(true);
      setError(null);
      setSuccess(null);

      await createPublicOrder({
        restaurantId: selectedRestaurantId,
        customer: {
          name: user?.name,
          phone: user?.phoneNumber,
          email: user?.email,
        },
        items: cart.map((item) => ({
          menuId: item.menuId ?? item._id,
          quantity: item.quantity,
        })),
        address: address.trim(),
        paymentMethod,
      });

      setCart([]);
      setAddress("");
      setSuccess("Order placed successfully. The restaurant will now process your prepared items.");
      await loadMenu(selectedRestaurantId);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to place order.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (userLoading || loading) {
    return <ThreeDotsLoader fullScreen />;
  }

  if (!user || user.role !== "customer") {
    return (
      <div className="min-h-screen bg-[#F7F1E8] px-4 py-6 text-[#1D2A20] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <section className="rounded-xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-[#8A7A62]">Customer Access</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#2A241B]">
              Customer Account Required
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#6B5C46]">
              Sign in with a customer account to browse restaurant menus and place orders.
            </p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F1E8] px-4 py-6 text-[#1D2A20] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-xl border border-[#E4DCCF] bg-white/90 p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#8A7A62]">
                Customer Dashboard
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-[#2A241B] sm:text-3xl">
                Welcome, {user.name}
              </h1>
              <p className="mt-1 text-sm text-[#6B5C46]">
                Select a restaurant, filter the prepared menu, and place your order with live stock visibility.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedRestaurantId}
                onChange={(event) => {
                  const nextRestaurantId = event.target.value;
                  setSelectedRestaurantId(nextRestaurantId);
                  setCart([]);
                  void loadMenu(nextRestaurantId);
                }}
                className="rounded-lg border border-[#E0D5C3] bg-white px-4 py-2 text-sm font-medium text-[#2A241B] shadow-sm"
              >
                {restaurants.map((restaurant) => (
                  <option key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => selectedRestaurantId && void loadMenu(selectedRestaurantId)}
                disabled={menuLoading || !selectedRestaurantId}
                className="inline-flex items-center gap-2 rounded-lg border border-[#E0D5C3] bg-white px-4 py-2 text-sm font-semibold text-[#2A241B] shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiRefreshCw className="h-4 w-4" aria-hidden="true" />
                {menuLoading ? "Refreshing..." : "Refresh"}
              </button>

            </div>
          </div>

          {selectedRestaurant && (
            <div className="mt-4 rounded-lg border border-[#E4DCCF] bg-[#F9F4EC] px-4 py-3 text-sm text-[#2A241B]">
              <span className="inline-flex items-center gap-2 font-medium">
                <FiMapPin className="h-4 w-4 text-[#8A7A62]" />
                {selectedRestaurant.name}
              </span>
              <span className="ml-3 text-[#6B5C46]">
                {selectedRestaurant.location || "Location available at restaurant"}
              </span>
            </div>
          )}

          {(loading || menuLoading) && !items.length && !error && <ThreeDotsLoader />}
          {error && (
            <div className="mt-5 rounded-lg border border-[#F0D2C0] bg-[#FFF7F2] p-4 text-sm text-[#9B3F2C]">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-5 rounded-lg border border-[#CFE1D6] bg-[#F3FAF5] p-4 text-sm text-[#2F6A4A]">
              {success}
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-lg border border-[#E4DCCF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">Prepared Items</p>
              <FiCoffee className="h-4 w-4 text-[#3F6F5B]" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-[#2A241B]">{items.length}</p>
            <p className="mt-1 text-xs text-[#6B5C46]">Ready-to-serve dishes in selected restaurant</p>
          </article>

          <article className="rounded-lg border border-[#E4DCCF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">Available Now</p>
              <FiPackage className="h-4 w-4 text-[#2A241B]" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-[#2A241B]">{inStockItems.length}</p>
            <p className="mt-1 text-xs text-[#6B5C46]">Items currently ready for ordering</p>
          </article>

          <article className="rounded-lg border border-[#E4DCCF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">Categories</p>
              <FiShoppingBag className="h-4 w-4 text-[#3F6F5B]" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-[#2A241B]">{categories.length}</p>
            <p className="mt-1 text-xs text-[#6B5C46]">Prepared food sections to browse</p>
          </article>

          <article className="rounded-lg border border-[#E4DCCF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">Cart Total</p>
              <FiClock className="h-4 w-4 text-[#B85C38]" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-[#2A241B]">{formatCurrency(cartTotal)}</p>
            <p className="mt-1 text-xs text-[#6B5C46]">{cart.length} item lines in your basket</p>
          </article>
        </section>

        <section className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <FiFilter className="h-4 w-4 text-[#8A6A3D]" />
            <h2 className="text-lg font-semibold text-[#2A241B]">Filter Menu</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="block text-sm">
              <span className="sr-only">Search menu</span>
              <div className="relative h-11">
                <span className="pointer-events-none absolute left-4 top-0 flex h-11 items-center justify-center">
                  <FiSearch className="h-4 w-4 text-[#8A7A62]" />
                </span>
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search prepared items"
                  className="h-full w-full rounded-lg border border-[#E0D5C3] bg-white pl-11 pr-4 text-[#2A241B]"
                />
              </div>
            </label>

            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-sm text-[#2A241B]"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={availabilityFilter}
              onChange={(event) => setAvailabilityFilter(event.target.value)}
              className="rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-sm text-[#2A241B]"
            >
              <option value="all">All availability</option>
              <option value="available">Available now</option>
              <option value="sold_out">Sold out</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-sm text-[#2A241B]"
            >
              <option value="featured">Featured</option>
              <option value="price_low">Price: Low to high</option>
              <option value="price_high">Price: High to low</option>
              <option value="availability">Most available</option>
            </select>
          </div>
        </section>

        <section id="filters" className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div id="browse" className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#2A241B]">Prepared Menu</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
                Real-world customer ordering view
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {filteredItems.map((item) => (
                  <article
                    key={item._id}
                    className="rounded-xl border border-[#EEE4D5] bg-[#F9F4EC] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-semibold text-[#2A241B]">{item.name}</h4>
                        <p className="mt-1 text-sm text-[#6B5C46]">
                          {item.category || "Chef Specials"}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#6B5C46]">
                        {formatCurrency(item.price)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-[#6B5C46]">
                      {item.description || "Freshly prepared and served based on current kitchen stock."}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.inStock
                            ? "bg-[#ECF6F2] text-[#2D6659]"
                            : "bg-[#FFF2EE] text-[#9B3F2C]"
                        }`}
                      >
                        {item.inStock ? "Available Now" : "Currently Unavailable"}
                      </span>
                      <span className="text-xs text-[#8A7A62]">
                        {item.availableQuantity} {item.unit || "portion"} ready
                      </span>
                    </div>

                    {!item.isOrderable && (
                      <p className="mt-3 text-xs text-[#9B3F2C]">
                        Visible from prepared inventory, but not yet published as an orderable menu item.
                      </p>
                    )}

                    <button
                      onClick={() => addToCart(item)}
                      disabled={!item.inStock || !item.isOrderable || !item.menuId}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2A241B] px-4 py-2 text-sm font-semibold text-[#F7F1E8] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FiShoppingCart className="h-4 w-4" />
                      {item.isOrderable ? "Add to cart" : "Menu setup needed"}
                    </button>
                  </article>
                ))}

                {!loading && !menuLoading && !filteredItems.length && (
                  <div className="rounded-xl border border-dashed border-[#E4DCCF] bg-[#FCFAF6] p-6 text-sm text-[#8A7A62]">
                    No prepared items match your filters right now.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-[#D6B26E] bg-[#2A241B] p-6 text-[#F7F1E8] shadow-lg">
              <p className="text-xs uppercase tracking-[0.28em] text-[#E4C992]">Featured Picks</p>
              <div className="mt-3 space-y-3 text-sm">
                {featuredItems.map((item) => (
                  <div key={`featured-${item._id}`}>
                    <p className="font-semibold">{item.name}</p>
                    <p className="mt-1 text-[#E9DDC9]">
                      {formatCurrency(item.price)} and {item.availableQuantity} {item.unit || "portion"} available
                    </p>
                  </div>
                ))}
                {!featuredItems.length && (
                  <p className="text-[#E9DDC9]">Featured prepared items will appear here.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div id="cart" className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#2A241B]">Your Cart</h3>
              <div className="mt-4 space-y-3">
                {cart.map((item) => (
                  <div
                    key={`cart-${item._id}`}
                    className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] px-3 py-3 text-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-[#2A241B]">{item.name}</span>
                      <span className="text-[#8A7A62]">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => updateCartQuantity(item._id, item.quantity - 1)}
                        className="rounded-md border border-[#E0D5C3] px-3 py-1 text-xs font-semibold text-[#2A241B]"
                      >
                        -
                      </button>
                      <span className="min-w-[28px] text-center font-semibold text-[#2A241B]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item._id, item.quantity + 1)}
                        className="rounded-md border border-[#E0D5C3] px-3 py-1 text-xs font-semibold text-[#2A241B]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
                {!cart.length && (
                  <p className="text-sm text-[#8A7A62]">No items in cart yet.</p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[#EEE4D5] pt-4">
                <span className="font-medium text-[#2A241B]">Total</span>
                <span className="text-lg font-semibold text-[#2A241B]">{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#2A241B]">Checkout</h3>
              <div className="mt-4 space-y-3">
                <textarea
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  rows={4}
                  placeholder="Delivery address"
                  className="w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-3 text-sm text-[#2A241B]"
                />
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value as "cod" | "online")}
                  className="w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-sm text-[#2A241B]"
                >
                  <option value="cod">Cash on delivery</option>
                  <option value="online">Online payment</option>
                </select>
                <button
                  onClick={() => void handlePlaceOrder()}
                  disabled={submittingOrder || !cart.length}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2A241B] px-4 py-3 text-sm font-semibold text-[#F7F1E8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiShoppingBag className="h-4 w-4" />
                  {submittingOrder ? "Placing order..." : "Place Order"}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#2A241B]">Quick Notes</h3>
              <div className="mt-4 space-y-3 text-sm text-[#6B5C46]">
                <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] px-3 py-2">
                  Restaurant dropdown appears after customer sign-in and loads that restaurant&apos;s prepared menu.
                </div>
                <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] px-3 py-2">
                  Only prepared items are shown to keep the customer menu clean and realistic.
                </div>
                <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] px-3 py-2">
                  Live availability helps customers avoid ordering items that are already sold out.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomerDashboard;
