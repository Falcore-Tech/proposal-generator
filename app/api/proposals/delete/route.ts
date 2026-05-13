import { createClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/auth/api";

export async function POST(request: Request) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    // Parse the request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return Response.json(
        { error: 'Invalid JSON in request body' }, 
        { status: 400 }
      );
    }
    
    const { id } = body;
    
    if (!id) {
      return Response.json(
        { error: 'Proposal ID is required' }, 
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // First delete any proposal links
    const { error: linksError } = await supabase
      .from('proposal_links')
      .delete()
      .eq('proposal_id', id);
      
    if (linksError) {
      console.error('Error deleting proposal links:', linksError);
      return Response.json(
        { error: linksError.message }, 
        { status: 500 }
      );
    }
    
    // Then delete any service relationships
    const { error: servicesError } = await supabase
      .from('proposal_services')
      .delete()
      .eq('proposal_id', id);
      
    if (servicesError) {
      console.error('Error deleting proposal services:', servicesError);
      return Response.json(
        { error: servicesError.message }, 
        { status: 500 }
      );
    }
    
    // Finally delete the proposal itself
    const { error: proposalError } = await supabase
      .from('proposals')
      .delete()
      .eq('id', id);
      
    if (proposalError) {
      console.error('Error deleting proposal:', proposalError);
      return Response.json(
        { error: proposalError.message }, 
        { status: 500 }
      );
    }
    
    return Response.json({ 
      success: true,
      message: 'Proposal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' }, 
      { status: 500 }
    );
  }
}
