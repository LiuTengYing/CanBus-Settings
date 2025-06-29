import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Modal from 'flarum/common/components/Modal';

export default class ConfigList extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    
    this.yearId = this.attrs.yearId;
    this.configs = [];
    this.loading = true;
    this.newConfigName = '';
    
    this.loadConfigs();
  }
  
  loadConfigs(forceRefresh = false) {
    if (!this.yearId) {
      this.configs = [];
      this.loading = false;
      m.redraw();
      return;
    }
    
    this.loading = true;
    
    app.request({
      method: 'GET',
      url: app.forum.attribute('apiUrl') + '/canbus/configs',
      params: {
        'filter[year_id]': this.yearId
      }
    }).then(result => {
      this.configs = result.data || [];
      this.loading = false;
      m.redraw();
      
      if (forceRefresh) {
        this.loadConfigs(false);
      }
    }).catch(error => {
      this.configs = [];
      this.loading = false;
      m.redraw();
    });
  }
  
  view() {
    if (!this.yearId) {
      return <div className="ConfigList">
        <p>Please select a year first.</p>
      </div>;
    }
    
    return (
      <div className="ConfigList">
        <h3>Configuration List</h3>
        
        <div className="CanBusForm">
          <div className="form-group">
            <label>Add New Configuration</label>
            <input 
              type="text" 
              className="FormControl" 
              value={this.newConfigName} 
              oninput={e => this.newConfigName = e.target.value} 
              placeholder="e.g. Manual AC" 
            />
          </div>
          
          <Button
            className="Button Button--primary"
            disabled={this.loading}
            onclick={() => this.saveConfig()}
          >
            Add Configuration
          </Button>
        </div>
        
        {this.loading ? (
          <LoadingIndicator />
        ) : (
          <table className="CanBusTable">
            <thead>
              <tr>
                <th>{app.translator.trans('ltydi-canbus-settings.admin.configs.config_name')}</th>
                <th className="actions">{app.translator.trans('ltydi-canbus-settings.admin.common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {this.configs.map(config => (
                <tr key={config.id}>
                  <td>{config.attributes.name}</td>
                  <td className="actions">
                    {Button.component({
                      className: 'Button Button--icon',
                      icon: 'fas fa-edit',
                      onclick: () => this.editConfig(config),
                      title: app.translator.trans('ltydi-canbus-settings.admin.common.edit_title')
                    })}
                    
                    {Button.component({
                      className: 'Button Button--icon',
                      icon: 'fas fa-trash',
                      onclick: () => this.deleteConfig(config),
                      title: app.translator.trans('ltydi-canbus-settings.admin.common.delete_title')
                    })}
                    
                    {Button.component({
                      className: 'Button Button--icon',
                      icon: 'fas fa-arrow-right',
                      onclick: () => this.attrs.onSelect(config),
                      title: app.translator.trans('ltydi-canbus-settings.admin.configs.view_links_title')
                    })}
                  </td>
                </tr>
              ))}
              
              {this.configs.length === 0 && (
                <tr>
                  <td colSpan="2" className="text-center">
                    {app.translator.trans('ltydi-canbus-settings.admin.configs.no_configs')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    );
  }
  
  saveConfig() {
    if (!this.newConfigName || !this.newConfigName.trim()) return;
    
    this.loading = true;
    
    const requestData = {
      data: {
        type: 'canbus-configs',
        attributes: {
          name: this.newConfigName.trim()
        },
        relationships: {
          year: {
            data: {
              type: 'canbus-years',
              id: this.yearId
            }
          }
        }
      }
    };
    
    app.request({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/canbus/configs',
      body: requestData
    }).then(result => {
      this.configs.push(result.data);
      this.newConfigName = '';
      this.loading = false;
      m.redraw();
    }).catch(error => {
      this.loading = false;
      m.redraw();
      alert('Error adding configuration: ' + (error.response?.errors?.[0]?.detail || error));
    });
  }
  
  editConfig(config) {
    app.modal.show(EditConfigModal, {
      config: config,
      onsubmit: (newName) => {
        if (!newName || newName === config.attributes.name) return;
        
        this.loading = true;
        
        const requestData = {
          data: {
            type: 'canbus-configs',
            id: config.id,
            attributes: {
              name: newName.trim()
            }
          }
        };
        
        app.request({
          method: 'PATCH',
          url: app.forum.attribute('apiUrl') + '/canbus/configs/' + config.id,
          body: requestData
        }).then(result => {
          const index = this.configs.findIndex(c => c.id === config.id);
          if (index !== -1) {
            this.configs[index] = result.data;
          }
          this.loading = false;
          m.redraw();
          
          this.loadConfigs(true);
          
          app.alerts.show({type: 'success'}, `Configuration updated successfully to: ${newName.trim()}`);
        }).catch(error => {
          this.loading = false;
          m.redraw();
          alert('Error updating configuration: ' + (error.response?.errors?.[0]?.detail || error));
        });
      }
    });
  }
  
  deleteConfig(config) {
    app.modal.show(DeleteConfigModal, {
      config: config,
      onconfirm: () => {
        this.loading = true;
        
        app.request({
          method: 'DELETE',
          url: app.forum.attribute('apiUrl') + '/canbus/configs/' + config.id
        }).then(() => {
          this.configs = this.configs.filter(c => c.id !== config.id);
          this.loading = false;
          m.redraw();
        }).catch(error => {
          this.loading = false;
          m.redraw();
          alert('Error deleting configuration: ' + (error.response?.errors?.[0]?.detail || error));
        });
      }
    });
  }
}

// Edit Config Modal
class EditConfigModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);
    this.config = this.attrs.config;
    this.newName = this.config.attributes.name || '';
  }
  
  className() {
    return 'EditConfigModal Modal--small';
  }
  
  title() {
    return 'Edit Configuration';
  }
  
  content() {
    return (
      <div className="Modal-body">
        <div className="Form">
          <div className="Form-group">
            <label>Configuration Name</label>
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

// Delete Config Modal
class DeleteConfigModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);
    this.config = this.attrs.config;
  }
  
  className() {
    return 'DeleteConfigModal Modal--small';
  }
  
  title() {
    return 'Confirm Deletion';
  }
  
  content() {
    return (
      <div className="Modal-body">
        <p>Are you sure you want to delete the configuration "{this.config.attributes.name}"? This will also delete all associated links.</p>
        
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