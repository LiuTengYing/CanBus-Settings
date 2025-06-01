import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Modal from 'flarum/common/components/Modal';

export default class LinkList extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    
    try {
      console.log("LinkList initializing with attrs:", vnode.attrs);
      
      this.configId = vnode.attrs ? vnode.attrs.configId : null;
      console.log("Extracted configId:", this.configId);
      
      this.links = [];
      this.loading = true;
      this.newLink = '';
      this.newLinkDescription = '';
      
      if (!this.configId) {
        console.error('ConfigId is missing or invalid:', this.configId, ', cannot load links');
        this.loading = false;
        return;
      }
      
      setTimeout(() => {
        try {
          this.loadLinks();
        } catch (e) {
          console.error("Error in delayed loadLinks:", e);
          this.loading = false;
          m.redraw();
        }
      }, 100);
    } catch (error) {
      console.error("Error in LinkList initialization:", error);
      this.loading = false;
    }
  }
  
  loadLinks() {
    try {
      if (!this.configId) {
        console.error('Attempting to load links but configId is missing');
        this.links = [];
        this.loading = false;
        m.redraw();
        return;
      }
      
      this.loading = true;
      console.log('Loading links for config ID:', this.configId);
      
      app.request({
        method: 'GET',
        url: `${app.forum.attribute('apiUrl')}/canbus/links`,
        params: {
          'filter[config_id]': this.configId
        }
      }).then(response => {
        console.log('Loaded links:', response);
        
        if (response && response.data) {
          this.links = Array.isArray(response.data) ? response.data : [];
        } else {
          console.warn('Response missing data property:', response);
          this.links = [];
        }
        
        this.loading = false;
        m.redraw();
      }).catch(error => {
        console.error('Error loading links:', error);
        console.error('Response:', error.response);
        this.links = [];
        this.loading = false;
        m.redraw();
      });
    } catch (error) {
      console.error("Unexpected error in loadLinks:", error);
      this.links = [];
      this.loading = false;
      m.redraw();
    }
  }
  
  view() {
    try {
      if (!this.configId) {
        return (
          <div className="LinkList">
            <h3>Link List</h3>
            <div className="CanBusNoLink">
              <p>No configuration selected. Please choose a configuration first.</p>
            </div>
          </div>
        );
      }
      
      const hasExistingLink = this.links && Array.isArray(this.links) && this.links.length > 0;
      
      return (
        <div className="LinkList">
          <h3>Link List</h3>
          
          {!hasExistingLink && !this.loading && (
            <div className="CanBusForm">
              <div className="form-group">
                <label>Add Link</label>
                <input 
                  type="text" 
                  className="FormControl" 
                  value={this.newLink} 
                  oninput={e => this.newLink = e.target.value} 
                  placeholder="https://example.com/canbus-link" 
                />
                
                <label style={{ marginTop: '10px' }}>Link Description</label>
                <textarea
                  className="FormControl"
                  value={this.newLinkDescription || ""}
                  oninput={e => this.newLinkDescription = e.target.value}
                  placeholder="Optional: Add a description for this link"
                  rows="3"
                />
              </div>
              
              <Button
                className="Button Button--primary"
                disabled={this.loading}
                onclick={() => this.saveLink()}
              >
                Add Link
              </Button>
            </div>
          )}
          
          {this.loading ? (
            <LoadingIndicator />
          ) : (
            <table className="CanBusTable">
              <thead>
                <tr>
                  <th>{app.translator.trans('ltydi-canbus-settings.admin.links.link_url')}</th>
                  <th className="actions">{app.translator.trans('ltydi-canbus-settings.admin.common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {this.links && this.links.map(link => {
                  if (!link || !link.attributes) {
                    console.error('Invalid link data:', link);
                    return null;
                  }
                  
                  return (
                    <tr key={link.id}>
                      <td>
                        {[
                          <div className="link-url">
                            <a href={link.attributes.url} target="_blank" rel="noopener noreferrer">
                              {link.attributes.url}
                            </a>
                          </div>,
                          link.attributes.description && (
                            <div className="LinkDescription" style={{ marginTop: '5px', fontSize: '0.9em', color: '#666' }}>
                              {link.attributes.description}
                            </div>
                          )
                        ]}
                      </td>
                      <td className="actions">
                        {Button.component({
                          className: 'Button Button--icon',
                          icon: 'fas fa-edit',
                          onclick: () => this.editLink(link),
                          title: app.translator.trans('ltydi-canbus-settings.admin.common.edit_title')
                        })}
                        
                        {Button.component({
                          className: 'Button Button--icon',
                          icon: 'fas fa-trash',
                          onclick: () => this.deleteLink(link),
                          title: app.translator.trans('ltydi-canbus-settings.admin.common.delete_title')
                        })}
                      </td>
                    </tr>
                  );
                })}
                
                {(!this.links || this.links.length === 0) && (
                  <tr>
                    <td colSpan="2" className="text-center">
                      {app.translator.trans('ltydi-canbus-settings.admin.links.no_links')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      );
    } catch (error) {
      console.error("Error in LinkList view:", error);
      return (
        <div className="LinkList">
          <h3>Link List</h3>
          <div className="CanBusError">
            <p>An error occurred while displaying links. Please try again or contact support.</p>
            <p className="ErrorDetails">{error.message}</p>
          </div>
        </div>
      );
    }
  }
  
  saveLink() {
    if (!this.newLink || !this.newLink.trim()) return;
    
    if (this.links.length > 0) {
      alert('Each configuration can only have one link.');
      return;
    }
    
    this.loading = true;
    console.log('Adding new link for config ID:', this.configId);
    
    const data = {
      data: {
        type: 'canbus-links',
        attributes: {
          url: this.newLink.trim(),
          description: this.newLinkDescription ? this.newLinkDescription.trim() : ''
        },
        relationships: {
          config: {
            data: {
              type: 'canbus-configs',
              id: this.configId
            }
          }
        }
      }
    };
    
    console.log('Request data:', data);
    
    app.request({
      method: 'POST',
      url: `${app.forum.attribute('apiUrl')}/canbus/links`,
      body: data
    }).then(response => {
      console.log('Link added successfully:', response);
      this.links.push(response.data);
      this.newLink = '';
      this.newLinkDescription = '';
      this.loading = false;
      
      // 通知父组件保持当前视图
      if (this.attrs.onUpdate) {
        this.attrs.onUpdate({
          action: 'add',
          configId: this.configId
        });
      }
      
      m.redraw();
    }).catch(error => {
      console.error('Error adding link:', error);
      console.error('Request data:', data);
      console.error('Response:', error.response);
      this.loading = false;
      m.redraw();
      alert('Error adding link: ' + (error.response?.errors?.[0]?.detail || error));
    });
  }
  
  editLink(link) {
    if (!link || !link.attributes) {
      console.error('Link object or attributes are undefined');
      return;
    }
    
    app.modal.show(EditLinkModal, {
      link: link,
      onsubmit: (url, description) => {
        if (!url || url === link.attributes.url && description === link.attributes.description) return;
        
        this.loading = true;
        
        const data = {
          data: {
            type: 'canbus-links',
            id: link.id,
            attributes: {
              url: url.trim(),
              description: description ? description.trim() : ''
            }
          }
        };
        
        app.request({
          method: 'PATCH',
          url: `${app.forum.attribute('apiUrl')}/canbus/links/${link.id}`,
          body: data
        }).then(response => {
          const index = this.links.findIndex(l => l.id === link.id);
          if (index !== -1) {
            this.links[index] = response.data;
          }
          this.loading = false;
          
          // 保持当前状态并通知父组件
          if (this.attrs.onUpdate) {
            this.attrs.onUpdate({
              action: 'edit',
              configId: this.configId
            });
          }
          
          m.redraw();
        }).catch(error => {
          this.loading = false;
          m.redraw();
          alert('Error updating link: ' + (error.response?.errors?.[0]?.detail || error));
        });
      }
    });
  }
  
  deleteLink(link) {
    app.modal.show(DeleteConfirmModal, {
      onconfirm: () => {
        this.loading = true;
        
        app.request({
          method: 'DELETE',
          url: `${app.forum.attribute('apiUrl')}/canbus/links/${link.id}`
        }).then(() => {
          this.links = this.links.filter(l => l.id !== link.id);
          this.loading = false;
          
          // 通知父组件保持当前视图
          if (this.attrs.onUpdate) {
            this.attrs.onUpdate({
              action: 'delete',
              configId: this.configId
            });
          }
          
          m.redraw();
        }).catch(error => {
          this.loading = false;
          m.redraw();
          alert('Error deleting link: ' + (error.response?.errors?.[0]?.detail || error));
        });
      }
    });
  }
}

// 创建编辑链接的模态框
class EditLinkModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);
    this.link = this.attrs.link;
    this.url = this.link.attributes.url || '';
    this.description = this.link.attributes.description || '';
  }
  
  className() {
    return 'EditLinkModal Modal--small';
  }
  
  title() {
    return 'Edit Link';
  }
  
  content() {
    return (
      <div className="Modal-body">
        <div className="Form">
          <div className="Form-group">
            <label>Link URL</label>
            <input 
              className="FormControl" 
              type="text" 
              value={this.url} 
              oninput={e => this.url = e.target.value} 
            />
          </div>
          
          <div className="Form-group">
            <label>Link Description (Optional)</label>
            <textarea 
              className="FormControl" 
              value={this.description} 
              oninput={e => this.description = e.target.value}
              rows="3"
            />
          </div>
          
          <div className="Form-group">
            <Button
              className="Button Button--primary"
              type="submit"
              onclick={() => {
                this.attrs.onsubmit(this.url, this.description);
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

// 创建删除确认的模态框
class DeleteConfirmModal extends Modal {
  className() {
    return 'DeleteConfirmModal Modal--small';
  }
  
  title() {
    return 'Confirm Deletion';
  }
  
  content() {
    return (
      <div className="Modal-body">
        <p>Are you sure you want to delete this link?</p>
        
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