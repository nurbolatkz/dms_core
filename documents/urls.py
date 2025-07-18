from django.urls import path
from documents.views import document_list, login_view,document_detail_page,sign_document_api, reject_document_api,send_created_new_doc

urlpatterns = [
    path('', document_list, name='document_list'),
    path('accounts/login/', login_view, name='login'),
    path('accounts/logout/', login_view, name='logout'),
    path('documents/<int:pk>/detail/', document_detail_page, name='document_detail_page'),
    path('api/documents/<int:pk>/sign/', sign_document_api, name='sign_document_api'),
    path('api/documents/<int:pk>/reject/', reject_document_api, name='reject_document_api'),
    path('api/send-doc/', send_created_new_doc, name='send_created_new_doc'),
]