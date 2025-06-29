import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Modal from 'flarum/common/components/Modal';
import EditBrandModal from './EditBrandModal';
import DeleteBrandModal from './DeleteBrandModal';

export default class BrandList extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    
    this.brands = this.attrs.brands || [];
    this.loading = false;
    this.newBrand = '';
  }
  
  view() {
    return (
      <div className="BrandList">
        <h3>Car Brands</h3>
        
        <div className="CanBusForm">
          <div className="form-group">
            <label>Add New Brand</label>
            <input 
              type="text" 
              className="FormControl" 
              value={this.newBrand} 
              oninput={e => this.newBrand = e.target.value} 
              placeholder="Enter brand name" 
            />
          </div>
          
          {Button.component({
            className: 'Button Button--primary',
            disabled: this.loading,
            onclick: () => this.saveBrand(),
          }, 'Add Brand')}
        </div>
        
        {this.loading ? (
          <LoadingIndicator />
        ) : (
          <table className="CanBusTable">
            <thead>
              <tr>
                <th>Brand Name</th>
                <th className="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.brands.map(brand => (
                <tr key={brand.id}>
                  <td>{brand.attributes.name}</td>
                  <td className="actions">
                    {Button.component({
                      className: 'Button Button--icon',
                      icon: 'fas fa-edit',
                      onclick: () => this.editBrand(brand),
                    })}
                    
                    {Button.component({
                      className: 'Button Button--icon',
                      icon: 'fas fa-trash',
                      onclick: () => this.deleteBrand(brand),
                    })}
                    
                    {Button.component({
                      className: 'Button Button--icon',
                      icon: 'fas fa-arrow-right',
                      onclick: () => this.attrs.onSelect(brand),
                    })}
                  </td>
                </tr>
              ))}
              
              {this.brands.length === 0 && (
                <tr>
                  <td colSpan="2" className="text-center">
                    No brands found. Add your first brand above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    );
  }
  
  saveBrand() {
    if (!this.newBrand.trim()) return;
    
    this.loading = true;
    
    app.request({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/canbus/brands',
      data: {
        data: {
          type: 'canbus-brands',
          attributes: {
            name: this.newBrand
          }
        }
      }
    }).then(result => {
      this.brands.push(result.data);
      this.newBrand = '';
      this.loading = false;
      m.redraw();
    }).catch(error => {
      this.loading = false;
      m.redraw();
      alert('Error adding brand: ' + error);
    });
  }
  
  editBrand(brand) {
    app.modal.show(EditBrandModal, {
      brand: brand,
      onsubmit: (newName) => {
        if (!newName || newName === brand.attributes.name) return;
        
        this.loading = true;
        
        const requestData = {
          data: {
            type: 'canbus-brands',
            id: brand.id,
            attributes: {
              name: newName.trim()
            }
          }
        };
        
        app.request({
          method: 'PATCH',
          url: app.forum.attribute('apiUrl') + '/canbus/brands/' + brand.id,
          body: requestData
        }).then(result => {
          const index = this.brands.findIndex(b => b.id === brand.id);
          if (index !== -1) {
            this.brands[index] = result.data;
          }
          this.loading = false;
          m.redraw();
          
          // Force refresh the brand list
          this.loadBrands(true);
          
          app.alerts.show({type: 'success'}, `Brand updated successfully to: ${newName.trim()}`);
        }).catch(error => {
          console.error('Error updating brand:', error);
          console.error('Response:', error.response);
          this.loading = false;
          m.redraw();
          alert('Error updating brand: ' + (error.response?.errors?.[0]?.detail || error));
        });
      }
    });
  }
  
  deleteBrand(brand) {
    app.modal.show(DeleteBrandModal, {
      brand: brand,
      onconfirm: () => {
        this.loading = true;
        
        app.request({
          method: 'DELETE',
          url: app.forum.attribute('apiUrl') + '/canbus/brands/' + brand.id
        }).then(() => {
          this.brands = this.brands.filter(b => b.id !== brand.id);
          this.loading = false;
          m.redraw();
        }).catch(error => {
          console.error('Error deleting brand:', error);
          console.error('Response:', error.response);
          this.loading = false;
          m.redraw();
          alert('Error deleting brand: ' + (error.response?.errors?.[0]?.detail || error));
        });
      }
    });
  }

  loadBrands(forceRefresh = false) {
    this.loading = true;
    
    app.request({
      method: 'GET',
      url: app.forum.attribute('apiUrl') + '/canbus/brands'
    }).then(result => {
      this.brands = result.data || [];
      this.loading = false;
      m.redraw();
    }).catch(error => {
      console.error('Error loading brands:', error);
      this.brands = [];
      this.loading = false;
      m.redraw();
    });
  }
} 