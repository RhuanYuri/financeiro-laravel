<?php

namespace App\Http\Controllers;

use App\Models\Home;
use App\Models\Invite;
use App\Models\Member;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\InviteMember;

class MemberController extends Controller
{
    public function index()
    {
        $homeId = session('home_id');
        
        $members = Member::where('home_id', $homeId)
            ->with(['user', 'role'])
            ->get()
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'user_id' => $member->user_id,
                    'name' => $member->user->name,
                    'email' => $member->user->email,
                    'role' => $member->role->name ?? 'Membro',
                    'joined_at' => $member->created_at->format('d/m/Y'),
                ];
            });

        return response()->json($members);
    }

    public function destroy($id)
    {
        $homeId = session('home_id');
        $member = Member::where('id', $id)->where('home_id', $homeId)->firstOrFail();

        // Prevent deleting yourself (optional, but good practice)
        // if ($member->user_id === auth()->id()) {
        //     return response()->json(['message' => 'Você não pode se remover.'], 403);
        // }

        $member->delete();

        return response()->json(['message' => 'Membro removido com sucesso.']);
    }

    public function invite(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'Usuário não encontrado com este e-mail. Peça para ele se cadastrar primeiro.',
        ]);

        $homeId = session('home_id');
        $user = User::where('email', $request->email)->first();

        // Check if already a member
        if (Member::where('home_id', $homeId)->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Usuário já é membro desta casa.'], 422);
        }

        // Check if already invited
        if (Invite::where('home_id', $homeId)->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Usuário já possui um convite pendente.'], 422);
        }

        $invite = Invite::create([
            'home_id' => $homeId,
            'user_id' => $user->id,
            'type' => 'member', // Default type
        ]);

        // Send Email
        Mail::to($user->email)->send(new InviteMember($invite));

        return response()->json(['message' => 'Convite enviado com sucesso!']);
    }

    public function invites()
    {
        // Get invites for the current authenticated user
        $invites = Invite::where('user_id', auth()->id())
            ->with('home')
            ->get();

        return response()->json($invites);
    }
    
    public function acceptInvite($id)
    {
        $invite = Invite::where('id', $id)->where('user_id', auth()->id())->firstOrFail();
        
        // Add to Member
        Member::create([
            'home_id' => $invite->home_id,
            'user_id' => auth()->id(),
            'role_id' => 1, // Default Role ID, need to check roles table
            'type' => 'member'
        ]);
        
        $invite->delete(); // Remove invite after acceptance
        
        return response()->json(['message' => 'Convite aceito!']);
    }

    public function denyInvite($id)
    {
        $invite = Invite::where('id', $id)->where('user_id', auth()->id())->firstOrFail();
        $invite->delete();
        
        return response()->json(['message' => 'Convite recusado.']);
    }
}
