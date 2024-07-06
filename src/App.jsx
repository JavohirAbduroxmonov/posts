import Header from "./components/Header";
import SearchItem from "./components/SearchItem";
import AddItem from "./components/AddItem";
import Footer from "./components/Footer";
import { useState, useEffect } from "react";
import Content from "./components/Content";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

function App() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/items`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Network request failed: ${errorText}`);
        }

        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error(`Fetching error: ${error.message}`);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    setTimeout(() => {
      fetchItems();
    }, 800);
  }, []);

  const addNewItem = async (item) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network request failed: ${errorText}`);
      }

      // const data = await response.json();
      // console.log(data);
      const newItems = [...items, item];
      setItems(newItems);
    } catch (error) {}
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setNewItem("");

    const newItemObj = {
      id: `${Date.now()}`,
      item: newItem,
      checked: false,
    };

    addNewItem(newItemObj);
  };

  const checkItem = async (id, checked) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/items/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ checked: !checked }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network request failed: ${errorText}`);
      } else {
        toast.success("Success");
      }

      // const data = await response.json();
      // console.log(data);
    } catch (error) {}
  };
  const handleCheck = (id) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        const checked = item.checked;
        checkItem(id, checked);
        return { ...item, checked: !item.checked };
      }
      return item;
    });
    setItems(newItems);
  };

  const deleteItem = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/items/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Error",
          text: errorText,
          showConfirmButton: false,
          timer: 500,
        });
        throw new Error(`Network request failed: ${errorText}`);
      } else {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Your work has been saved",
          showConfirmButton: false,
          timer: 500,
        });
      }
      // const data = await response.json();
      // console.log(data);
    } catch (error) {
      console.error(`Fetching error: ${error.message}`);
    }
  };
  const handleDelete = (id) => {
    deleteItem(id);
    const newItems = items.filter((item) => item.id !== id);
    setItems(newItems);
  };

  return (
    <div className="App">
      <Header title="Grocery List" />
      <AddItem newItem={newItem} setNewItem={setNewItem} onSubmit={onSubmit} />
      <SearchItem search={search} setSearch={setSearch} />
      <main>
        {isLoading && (
          <div className="loading-container">
            <span className="loading-text">Loading</span>
            <span className="dot dot1">.</span>
            <span className="dot dot2">.</span>
            <span className="dot dot3">.</span>
          </div>
        )}
        {error && (
          <p style={{ marginTop: "2rem", color: "red", textAlign: "center" }}>
            {error}
          </p>
        )}
        {!isLoading && !error && (
          <Content
            items={items.filter((item) =>
              item.item.toLowerCase().includes(search.toLowerCase())
            )}
            handleCheck={handleCheck}
            handleDelete={handleDelete}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
