import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import axios from "axios";
import "./index.css";

class Inventory extends Component {
  constructor() {
    super();
    this.state = {
      inventory: [
        {
          id: 1,
          item_name: "Cereals",
          item_rate: 10.95,
          item_inventory: 53,
          item_quantity: 0,
          item_subtotal: 0
        },
        {
          id: 2,
          item_name: "Bread",
          item_rate: 3.99,
          item_inventory: 11,
          item_quantity: 0,
          item_subtotal: 0
        },
        {
          id: 3,
          item_name: "Milk",
          item_rate: 3.16,
          item_inventory: 20,
          item_quantity: 0,
          item_subtotal: 0
        }
      ],
      cart_total: 0,
      item_count: 0,
      addedToCart: false
    };
  }

  addToCart = () => {
    let CART_HOST_ELB = "oregonELB-875160293.us-west-2.elb.amazonaws.com";
    let PORT = 3000;
    let data = {
      username: sessionStorage.getItem("username"),
      items: this.state.inventory
    };
    axios
      .post(`http://${CART_HOST_ELB}:${PORT}/cart/add`, data)
      .then(response => {
        sessionStorage.setItem("cart_id", response.data.id);
        console.log("Response from POST Order:", response);
        this.setState({
          addedToCart: true
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          addedToCart: false
        });
      });
  };

  quantityChangeHandler = (e, id) => {
    let inventory = this.state.inventory;
    for (let item of inventory) {
      if (item.id === id) {
        if (e.target.value <= item.item_inventory) {
          item.item_quantity = parseInt(e.target.value);
          item.item_subtotal = parseFloat(
            (item.item_quantity * item.item_rate).toFixed(2)
          );
        }
      }
    }
    this.setState({ inventory: inventory });
    this.cartTotalChangeHandler();
    this.itemCountChangeHandler();
  };

  cartTotalChangeHandler() {
    let inventory = this.state.inventory;
    let total = 0;
    for (let item of inventory) {
      if (item.item_subtotal === undefined) item.item_subtotal = 0;
      total += item.item_subtotal;
    }
    this.setState({ cart_total: parseFloat(total.toFixed(2)) });
  }

  itemCountChangeHandler() {
    let inventory = this.state.inventory;
    let item_count = 0;
    for (let item of inventory) {
      item_count += item.item_quantity;
    }
    this.setState({ item_count: parseFloat(item_count.toFixed(2)) });
  }

  render() {
    let item_list = this.state.inventory.map(item => {
      return (
        <tr key={item.id}>
          <td className="item name col-lg-4">
            <Link to="">{item.item_name}</Link>
          </td>
          <td className="item rate col-lg-2">${item.item_rate}</td>
          <td className="item inventory col-lg-2">{item.item_inventory}</td>
          <td className="item quantity col-lg-2">
            <input
              value={item.item_quantity}
              min="0"
              max={item.item_inventory}
              onChange={e => this.quantityChangeHandler(e, item.id)}
              type="number"
            />
          </td>
          <td className="item subtotal col-lg-2">{item.item_subtotal}</td>
        </tr>
      );
    });
    return (
      <React.Fragment>
        {this.state.addedToCart && (
          <Redirect to={{ pathname: "/cart", state: this.state.item_count }} />
        )}
        <div className="container">
          <div id="title">
            <h2>Inventory</h2>
          </div>
          <table className="table table-hover">
            <thead>
              <tr>
                <th className="item name-header col-lg-4">Item</th>
                <th className="item rate-header col-lg-2">Rate</th>
                <th className="item inventory-header col-lg-2">
                  Items Available
                </th>
                <th className="item quantity-header col-lg-2">Quantity</th>
                <th className="item subtotal-header col-lg-2">Subtotal</th>
              </tr>
            </thead>
            <tbody
              className="card-parent table table-hover container grocery-item"
              style={{ margin: "auto" }}
            >
              {item_list}
            </tbody>
          </table>
          <div className="total-row row">
            <span className="col-lg-8" />
            <div className="item-count col-lg-2">
              Total Items: {this.state.item_count}
            </div>
            <div className="item-total col-lg-2">
              Order total:{" "}
              <span className="item-total-value">${this.state.cart_total}</span>
            </div>
          </div>
          <div className="total-row row">
            <span className="col-lg-10" />
            <span className="col-lg-2">
              <button
                onClick={this.addToCart}
                className="btn btn-block btn-login rounded-0"
              >
                Add to Cart
              </button>
            </span>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Inventory;
