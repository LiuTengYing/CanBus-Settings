import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Modal from 'flarum/common/components/Modal';

export default class ModelList extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    
    this.brandId = this.attrs.brandId;
    this.models = [];
    this.loading = true;
    this.newModel = '';
    
    this.loadModels();
  }
  
  loadModels() {
    this.loading = true;
    
    app.request({
      method: 'GET',
      url: app.forum.attribute('apiUrl') + '/canbus/models',
      params: {
        filter: { brand_id: this.brandId }
      }
    }).then(result => {
      this.models = result.data;
      this.loading = false;
      m.redraw();
    }).catch(error => {
      this.loading = false;
      m.redraw();
      alert('Error loading models: ' + error);
    });
  }
  
  view() {
    return (
      <div className="ModelList">
        <h3>Car Models</h3>
        
        <div className="CanBusForm">
          <div className="form-group">
            <label>Add New Model</label>
            <input 
              type="text" 
              className="FormControl" 
              value={this.newModel} 
              oninput={e => this.newModel = e.target.value} 
              placeholder="Enter model name" 
            />
          </div>
          
          {Button.component({
            className: 'Button Button--primary',
            disabled: this.loading,
            onclick: () => this.saveModel(),
          }, 'Add Model')}
        </div>
        
        {this.loading ? (
          <LoadingIndicator />
        ) : (
          <table className="CanBusTable">
            <thead>
              <tr>
                <th>{app.translator.trans('ltydi-canbus-settings.admin.models.model_name')}</th>
                <th className="actions">{app.translator.trans('ltydi-canbus-settings.admin.common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {this.models.map(model => (
                <tr key={model.id}>
                  <td>{model.attributes.name}</td>
                  <td className="actions">
                    {Button.component({
                      className: 'Button Button--icon',
                      icon: 'fas fa-edit',
                      onclick: () => this.editModel(model),
                      title: app.translator.trans('ltydi-canbus-settings.admin.common.edit_title')
                    })}
                    
                    {Button.component({
                      className: 'Button Button--icon',
                      icon: 'fas fa-trash',
                      onclick: () => this.deleteModel(model),
                      title: app.translator.trans('ltydi-canbus-settings.admin.common.delete_title')
                    })}
                    
                    {Button.component({
                      className: 'Button Button--icon',
                      icon: 'fas fa-arrow-right',
                      onclick: () => this.attrs.onSelect(model),
                      title: app.translator.trans('ltydi-canbus-settings.admin.models.view_years_title')
                    })}
                  </td>
                </tr>
              ))}
              
              {this.models.length === 0 && (
                <tr>
                  <td colSpan="2" className="text-center">
                    {app.translator.trans('ltydi-canbus-settings.admin.models.no_models')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    );
  }
  
  saveModel() {
    if (!this.newModel.trim()) {
      alert('Model name cannot be empty');
      return;
    }
    
    const modelName = this.newModel.trim();
    this.loading = true;
    
    // Using URL parameters to pass model name and brand ID
    const url = app.forum.attribute('apiUrl') + '/canbus/models?name=' + 
      encodeURIComponent(modelName) + '&brand_id=' + encodeURIComponent(this.brandId);
    
    console.log('Adding model:', modelName, 'for brand ID:', this.brandId);
    
    app.request({
      method: 'POST',
      url: url
    }).then(result => {
      this.models.push(result.data);
      this.newModel = '';
      this.loading = false;
      m.redraw();
    }).catch(error => {
      console.error('Error adding model:', error);
      
      // If failed, try using hardcoded method
      app.request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/canbus/models'
      }).then(result => {
        this.models.push(result.data);
        this.newModel = '';
        this.loading = false;
        m.redraw();
      }).catch(secondError => {
        console.error('Second attempt failed:', secondError);
        this.loading = false;
        m.redraw();
        alert('Error adding model: ' + (error.response && error.response.errors ? error.response.errors[0].detail : error));
      });
    });
  }
  
  editModel(model) {
    app.modal.show(EditModelModal, {
      model: model,
      onsubmit: (newName) => {
        if (!newName || newName === model.attributes.name) return;
        
        this.loading = true;
        
        const requestData = {
          data: {
            type: 'canbus-models',
            id: model.id,
            attributes: {
              name: newName.trim()
            }
          }
        };
        
        app.request({
          method: 'PATCH',
          url: app.forum.attribute('apiUrl') + '/canbus/models/' + model.id,
          body: requestData
        }).then(result => {
          const index = this.models.findIndex(m => m.id === model.id);
          if (index !== -1) {
            this.models[index] = result.data;
          }
          this.loading = false;
          m.redraw();
          
          // Force refresh model list
          this.loadModels(true);
          
          app.alerts.show({type: 'success'}, `Model updated successfully to: ${newName.trim()}`);
        }).catch(error => {
          console.error('Error updating model:', error);
          console.error('Response:', error.response);
          this.loading = false;
          m.redraw();
          alert('Error updating model: ' + (error.response?.errors?.[0]?.detail || error));
        });
      }
    });
  }
  
  deleteModel(model) {
    app.modal.show(DeleteModelModal, {
      model: model,
      onconfirm: () => {
        this.loading = true;
        
        console.log('Deleting model with ID:', model.id);
        console.log('Request URL:', app.forum.attribute('apiUrl') + '/canbus/models/' + model.id);
        console.log('Request method: DELETE');
        
        app.request({
          method: 'DELETE',
          url: app.forum.attribute('apiUrl') + '/canbus/models/' + model.id
        }).then(() => {
          console.log('Model deleted successfully');
          this.models = this.models.filter(m => m.id !== model.id);
          this.loading = false;
          m.redraw();
        }).catch(error => {
          console.error('Error deleting model:', error);
          console.error('Response:', error.response);
          this.loading = false;
          m.redraw();
          alert('Error deleting model: ' + (error.response?.errors?.[0]?.detail || error));
        });
      }
    });
  }
}

// Edit Model Modal
class EditModelModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);
    this.model = this.attrs.model;
    this.newName = this.model.attributes.name || '';
  }
  
  className() {
    return 'EditModelModal Modal--small';
  }
  
  title() {
    return 'Edit Model';
  }
  
  content() {
    return (
      <div className="Modal-body">
        <div className="Form">
          <div className="Form-group">
            <label>Model Name</label>
            <input 
              className="FormControl" 
              type="text" 
              value={this.newName} 
              oninput={e => this.newName = e.target.value} 
            />
          </div>
          
          <div className="Form-group">
            <Button
              className="Button Button--primary"
              type="submit"
              onclick={() => {
                this.attrs.onsubmit(this.newName);
                this.hide();
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

// Delete Model Modal
class DeleteModelModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);
    this.model = this.attrs.model;
  }
  
  className() {
    return 'DeleteModelModal Modal--small';
  }
  
  title() {
    return 'Confirm Deletion';
  }
  
  content() {
    return (
      <div className="Modal-body">
        <p>Are you sure you want to delete the model "{this.model.attributes.name}"? This will also delete all associated years, configs and links.</p>
        
        <div className="Form-group">
          <Button
            className="Button Button--primary Button--danger"
            onclick={() => {
              this.attrs.onconfirm();
              this.hide();
            }}
          >
            Delete
          </Button>
          {' '}
          <Button
            className="Button"
            onclick={() => this.hide()}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }
}